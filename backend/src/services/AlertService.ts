import { prisma } from '../lib/db.js'
import type { Alert, AlertCategory, Severity, Confidence, AlertSource, UserPreferences } from '../types/index.ts'
import { SmartCategoryMatcher } from '../lib/smartCategoryMatcher.js'

export interface AlertFilters {
  category?: string
  severity?: string
  status?: string
  source?: string
  location?: string
  affects_me?: boolean
  verification_status?: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateAlertData {
  title: string
  description: string
  category: string
  severity: Severity
  summary?: string
  suggested_action?: string
  reason?: string
  confidence?: Confidence
  source?: AlertSource
  location?: string
  date: string
  resolved?: boolean
  affects_me?: boolean
}

export interface UpdateAlertData {
  title?: string
  description?: string
  category?: string
  severity?: Severity
  summary?: string
  suggested_action?: string
  reason?: string
  confidence?: Confidence
  location?: string
  resolved?: boolean
  affects_me?: boolean
}

export class AlertService {
  async getAlerts(filters: AlertFilters = {}): Promise<any> {
    const where: any = {}

    // First, get user preferences for concerns and location filtering
    const userPrefs = await prisma.userPreference.findFirst({
      where: { id: 'default' }
    })
    const userConcerns = userPrefs?.concerns || []
    const userSeverities = userPrefs?.severities || []
    const userLocation = userPrefs?.user_coordinates as { lat: number; lng: number } | null
    const locationRadius = userPrefs?.location_radius || 25
    const locationEnabled = userPrefs?.location_enabled || false

    // Build where clause based on filters
    if (filters.category) {
      where.category = filters.category
    } else if (userConcerns.length > 0) {
      // Smart semantic matching of user concerns to categories
      const matchedCategories = SmartCategoryMatcher.matchConcernsToCategories(userConcerns)
      
      if (matchedCategories.length > 0) {
        where.category = { in: matchedCategories }
      }
    }

    if (filters.severity) {
      where.severity = filters.severity
    } else if (userSeverities.length > 0) {
      // If no explicit severity filter but user has severity preferences, filter by severities
      where.severity = { in: userSeverities }
    }

    if (filters.status === 'resolved') {
      where.resolved = true
    } else if (filters.status === 'unresolved') {
      where.resolved = false
    }
    if (filters.source) {
      where.source = filters.source
    }
    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' }
    } else if (locationEnabled && userLocation) {
      // Apply location-based filtering using user's location and radius
      // For now, we'll include alerts with location data
      // In a production system, you'd use spatial queries with PostGIS
      where.OR = [
        { location: { contains: 'Nationwide' } },
        { location: { not: null } }
      ]
    }
    if (filters.affects_me !== undefined) {
      where.affects_me = filters.affects_me
    }
    if (filters.verification_status) {
      where.verification_status = filters.verification_status
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    // Calculate pagination
    const page = filters.page || 1
    const limit = Math.min(filters.limit || 10, 100) // Default 10 per page, max 100 per page
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.alert.count({ where })

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: [
        { created_at: 'desc' },
        { severity: 'desc' },
      ],
      skip,
      take: limit,
    })

    // Get verification breakdown for alerts that have verifications
    const alertIds = alerts.map(a => a.id)
    const verificationBreakdowns = alertIds.length > 0 ? await prisma.alertVerification.groupBy({
      by: ['alert_id', 'verification_type'],
      where: {
        alert_id: { in: alertIds }
      },
      _count: {
        verification_type: true
      }
    }) : []

    // Transform verification data into a more usable format
    const verificationMap = verificationBreakdowns.reduce((acc, item) => {
      if (!acc[item.alert_id]) {
        acc[item.alert_id] = {}
      }
      acc[item.alert_id][item.verification_type] = item._count.verification_type
      return acc
    }, {} as Record<string, Record<string, number>>)

    // Apply location-based filtering and distance calculation
    const filteredAlerts = alerts.map(alert => {
      const alertData: any = {
        ...alert,
        created_at: alert.created_at.toISOString(),
        verification_breakdown: verificationMap[alert.id] || {}
      }

      // Calculate distance if user location is available
      if (locationEnabled && userLocation && alert.location) {
        const distance = this.calculateDistance(userLocation, alert.location)
        alertData.distance = distance
        alertData.within_radius = distance <= locationRadius
      }

      return alertData
    }).filter(alert => {
      // Filter by location radius if enabled
      if (locationEnabled && userLocation) {
        return alert.within_radius !== false
      }
      return true
    })

    // Sort by distance if location filtering is enabled
    if (locationEnabled && userLocation) {
      filteredAlerts.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    return {
      data: filteredAlerts as Alert[],
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    }
  }

  // Helper function to calculate distance (simplified version)
  private calculateDistance(userCoords: { lat: number; lng: number }, alertLocation: string): number {
    // This is a simplified version - in production, you'd use a proper geocoding service
    // For now, return a random distance for demonstration
    return Math.random() * 50 // Random distance in miles
  }

  async getAlertById(id: string): Promise<Alert | null> {
    const alert = await prisma.alert.findUnique({
      where: { id },
    })

    if (!alert) return null

    // Convert Date objects to strings for frontend compatibility
    return {
      ...alert,
      created_at: alert.created_at.toISOString()
    } as Alert
  }

  async createAlert(data: CreateAlertData): Promise<Alert> {
    const alert = await prisma.alert.create({
      data: {
        ...data,
        verification_count: 0,
        verification_status: 'pending',
      },
    })

    // Convert Date objects to strings for frontend compatibility
    return {
      ...alert,
      created_at: alert.created_at.toISOString()
    } as Alert
  }

  async updateAlert(id: string, data: UpdateAlertData): Promise<Alert | null> {
    const alert = await prisma.alert.update({
      where: { id },
      data,
    })

    // Convert Date objects to strings for frontend compatibility
    return {
      ...alert,
      created_at: alert.created_at.toISOString()
    } as Alert | null
  }

  async deleteAlert(id: string): Promise<boolean> {
    try {
      await prisma.alert.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }

  async verifyAlert(id: string, verificationType: 'verified' | 'fake' | 'disputed'): Promise<Alert | null> {
    // Get current alert
    const currentAlert = await prisma.alert.findUnique({
      where: { id },
    })

    if (!currentAlert) {
      return null
    }

    // Record verification in history first
    await prisma.$executeRaw`
      INSERT INTO "AlertVerification" (id, alert_id, verification_type, created_at)
      VALUES (gen_random_uuid(), ${id}, ${verificationType}, NOW())
    `

    // Get updated verification counts to determine aggregate status
    const verificationCounts = await prisma.$queryRaw`
      SELECT 
        verification_type,
        COUNT(*) as count
      FROM "AlertVerification" 
      WHERE alert_id = ${id}
      GROUP BY verification_type
    ` as Array<{ verification_type: string; count: number }>;

    // Determine aggregate verification status based on majority vote
    let aggregateStatus: 'pending' | 'verified' | 'fake' | 'disputed' = 'pending'
    let maxCount = 0

    verificationCounts.forEach(({ verification_type, count }) => {
      if (count > maxCount) {
        maxCount = count
        aggregateStatus = verification_type as 'verified' | 'fake' | 'disputed'
      }
    })

    // Update alert with new count and aggregate status
    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: {
        verification_count: (currentAlert.verification_count || 0) + 1,
        verification_status: aggregateStatus,
      },
    })

    // Convert Date objects to strings for frontend compatibility
    return {
      ...updatedAlert,
      created_at: updatedAlert.created_at.toISOString(),
    } as Alert | null
  }

  async getVerificationHistory(id: string): Promise<any[]> {
    try {
      // Use Prisma client approach instead of raw SQL
      const verifications = await prisma.alertVerification.groupBy({
        by: ['verification_type'],
        where: {
          alert_id: id
        },
        _count: {
          verification_type: true
        },
        _max: {
          created_at: true
        }
      })
      
      // Transform the result to match expected format
      const result = verifications.map(v => ({
        verification_type: v.verification_type,
        count: v._count.verification_type,
        latest_created: v._max.created_at
      }))
      
      return result
    } catch (error) {
      console.error('Error in getVerificationHistory:', error)
      // Return empty array instead of throwing
      return []
    }
  }

  async getAlertsByCategory(): Promise<Record<string, number>> {
    const result = await prisma.alert.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    })

    return result.reduce((acc, item) => {
      acc[item.category] = item._count.category
      return acc
    }, {} as Record<string, number>)
  }

  async getAlertsBySeverity(): Promise<Record<string, number>> {
    const result = await prisma.alert.groupBy({
      by: ['severity'],
      _count: {
        severity: true,
      },
    })

    return result.reduce((acc, item) => {
      acc[item.severity] = item._count.severity
      return acc
    }, {} as Record<string, number>)
  }

  async getVerificationStats(): Promise<any> {
    const totalAlerts = await prisma.alert.count()
    const verifiedAlerts = await prisma.alert.count({
      where: { verification_status: 'verified' },
    })
    const fakeAlerts = await prisma.alert.count({
      where: { verification_status: 'fake' },
    })
    const disputedAlerts = await prisma.alert.count({
      where: { verification_status: 'disputed' },
    })

    return {
      total: totalAlerts,
      verified: verifiedAlerts,
      fake: fakeAlerts,
      disputed: disputedAlerts,
      pending: totalAlerts - verifiedAlerts - fakeAlerts - disputedAlerts,
    }
  }
}
