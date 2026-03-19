import { Request, Response } from 'express'
import { z } from 'zod'

// Global cache to track if we've reached the limit
let alertLimitReached = false
let lastLimitCheck = 0
const LIMIT_CHECK_INTERVAL = 60000 // Check every minute

export class FeedController {
  private async checkAlertLimit(): Promise<boolean> {
    const now = Date.now()
    
    // Only check the database if we haven't checked recently or haven't hit the limit yet
    if (!alertLimitReached || (now - lastLimitCheck) > LIMIT_CHECK_INTERVAL) {
      const { prisma } = await import('../lib/db.js')
      const totalAlerts = await prisma.alert.count()
      alertLimitReached = totalAlerts >= 100
      lastLimitCheck = now
      console.log(`📊 Alert count check: ${totalAlerts}/100, limit reached: ${alertLimitReached}`)
    }
    
    return alertLimitReached
  }

  async fetchCISA(req: Request, res: Response) {
    try {
      console.log('🔗 Fetching CISA feed...')
      
      // Quick check if we've already reached the limit
      if (await this.checkAlertLimit()) {
        console.log('⚠️ Alert limit already reached (100), skipping CISA feed')
        return res.json({
          success: true,
          source: 'CISA KEV Catalog',
          retrieved: 0,
          processed: 0,
          upserted: 0,
          skipped: true,
          reason: 'Alert limit reached (100) - cached'
        })
      }
      
      // Get user preferences to check concerns
      const { prisma } = await import('../lib/db.js')
      const userPrefs = await prisma.userPreference.findFirst({
        where: { id: 'default' }
      })
      
      // Check total alerts count (double check)
      const totalAlerts = await prisma.alert.count()
      console.log(`📊 Current total alerts: ${totalAlerts}`)
      
      // Stop feed if we have 100+ alerts
      if (totalAlerts >= 100) {
        alertLimitReached = true
        console.log('⚠️ Alert limit reached (100), skipping feed')
        return res.json({
          success: true,
          source: 'CISA KEV Catalog',
          retrieved: 0,
          processed: 0,
          upserted: 0,
          skipped: true,
          reason: 'Alert limit reached (100)'
        })
      }
      
      // CISA KEV Catalog API
      const response = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json')
      
      if (!response.ok) {
        throw new Error(`CISA API returned ${response.status}`)
      }
      
      const data = await response.json()
      const vulnerabilities = data.vulnerabilities || []
      
      console.log(`📊 Retrieved ${vulnerabilities.length} vulnerabilities from CISA`)
      
      // Filter based on user concerns
      const userConcerns = userPrefs?.concerns || []
      const filteredVulnerabilities = vulnerabilities.filter((vuln: any) => {
        // Map CVE to concerns
        if (userConcerns.includes('CVE') || userConcerns.includes('Vulnerability')) {
          return true
        }
        if (userConcerns.includes('Critical') && vuln.cvssScore >= 9.0) {
          return true
        }
        return false
      })
      
      console.log(`📊 Filtered to ${filteredVulnerabilities.length} based on user concerns: ${userConcerns.join(', ')}`)
      
      // Transform to Alert schema (limit to remaining capacity)
      const remainingCapacity = 100 - totalAlerts
      const alerts = filteredVulnerabilities.slice(0, remainingCapacity).map((vuln: any, index: number) => ({
        id: `cisa-${vuln.cveID}-${Date.now()}-${index}`,
        title: `Critical CVE: ${vuln.cveID} - ${vuln.vulnerabilityName}`,
        description: `Critical vulnerability ${vuln.cveID} affecting ${vuln.vendorProject}. ${vuln.shortDescription}. Known to be actively exploited. CVSS score: ${vuln.cvssScore}. Required action: ${vuln.requiredAction}.`,
        category: 'CVE',
        severity: this.mapCVSSToSeverity(vuln.cvssScore),
        summary: `Critical ${vuln.cveID} vulnerability with CVSS ${vuln.cvssScore}`,
        suggested_action: vuln.requiredAction || 'Apply security patches immediately',
        reason: 'Critical vulnerability with known active exploitation',
        confidence: 'high',
        source: 'CISA',
        location: vuln.vendorProject || 'Multiple systems',
        date: vuln.dateAdded || new Date().toISOString().split('T')[0],
        resolved: false,
        affects_me: true, // Critical CVEs affect everyone
        verification_count: 0,
        verification_status: 'pending'
      }))
      
      // Upsert to database
      const results = await Promise.all(
        alerts.map(async (alert: any) => {
          return await prisma.alert.upsert({
            where: { id: alert.id },
            create: alert,
            update: {
              title: alert.title,
              description: alert.description,
              severity: alert.severity,
              date: alert.date
            }
          })
        })
      )
      
      console.log(`✅ Upserted ${results.length} CISA alerts to database`)
      
      res.json({
        success: true,
        source: 'CISA KEV Catalog',
        retrieved: vulnerabilities.length,
        filtered: filteredVulnerabilities.length,
        processed: alerts.length,
        upserted: results.length,
        userConcerns: userConcerns
      })
      
    } catch (error) {
      console.error('❌ CISA feed fetch failed:', error)
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch CISA feed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async fetchPhishTank(req: Request, res: Response) {
    try {
      console.log('🐟 Fetching PhishTank feed...')
      
      // Quick check if we've already reached the limit
      if (await this.checkAlertLimit()) {
        console.log('⚠️ Alert limit already reached (100), skipping PhishTank feed')
        return res.json({
          success: true,
          source: 'PhishTank',
          retrieved: 0,
          processed: 0,
          upserted: 0,
          skipped: true,
          reason: 'Alert limit reached (100) - cached'
        })
      }
      
      // Get user preferences to check concerns
      const { prisma } = await import('../lib/db.js')
      const userPrefs = await prisma.userPreference.findFirst({
        where: { id: 'default' }
      })
      
      // Check total alerts count (double check)
      const totalAlerts = await prisma.alert.count()
      console.log(`📊 Current total alerts: ${totalAlerts}`)
      
      // Stop feed if we have 100+ alerts
      if (totalAlerts >= 100) {
        alertLimitReached = true
        console.log('⚠️ Alert limit reached (100), skipping feed')
        return res.json({
          success: true,
          source: 'PhishTank',
          retrieved: 0,
          processed: 0,
          upserted: 0,
          skipped: true,
          reason: 'Alert limit reached (100)'
        })
      }
      
      // PhishTank provides a downloadable JSON data file
      const response = await fetch('https://phishtank.org/data/online-valid.json')
      
      if (!response.ok) {
        throw new Error(`PhishTank API returned ${response.status}`)
      }
      
      const data = await response.json()
      const phishingUrls = data || []
      
      console.log(`📊 Retrieved ${phishingUrls.length} phishing URLs from PhishTank`)
      
      // Filter based on user concerns
      const userConcerns = userPrefs?.concerns || []
      const filteredUrls = phishingUrls.filter((url: any) => {
        // Map phishing to concerns
        if (userConcerns.includes('Phishing') || userConcerns.includes('Scam')) {
          return true
        }
        return false
      })
      
      console.log(`📊 Filtered to ${filteredUrls.length} based on user concerns: ${userConcerns.join(', ')}`)
      
      // Transform to Alert schema (limit to remaining capacity)
      const remainingCapacity = 100 - totalAlerts
      const alerts = filteredUrls.slice(0, remainingCapacity).map((url: any, index: number) => ({
        id: `phishtank-${url.phish_id || index}-${Date.now()}-${index}`,
        title: `Phishing Site: ${(url.url || '').substring(0, 60)}...`,
        description: `Active phishing site detected. URL: ${url.url || 'N/A'}. Verified by PhishTank community.`,
        category: 'Phishing',
        severity: 'high',
        summary: `Active phishing site targeting users`,
        suggested_action: 'Block this URL and avoid clicking. Report to IT security team.',
        reason: 'Verified phishing site in PhishTank database',
        confidence: 'high',
        source: 'PhishTank',
        location: url.url || null,
        date: new Date().toISOString().split('T')[0], // Use today's date
        resolved: false,
        affects_me: false,
        verification_count: 1, // Already verified by PhishTank
        verification_status: 'verified'
      }))
      
      // Upsert to database
      const results = await Promise.all(
        alerts.map(async (alert: any) => {
          return await prisma.alert.upsert({
            where: { id: alert.id },
            create: alert,
            update: {
              title: alert.title,
              description: alert.description,
              date: alert.date
            }
          })
        })
      )
      
      console.log(`✅ Upserted ${results.length} PhishTank alerts to database`)
      
      res.json({
        success: true,
        source: 'PhishTank',
        retrieved: phishingUrls.length,
        filtered: filteredUrls.length,
        processed: alerts.length,
        upserted: results.length,
        userConcerns: userConcerns
      })
      
    } catch (error) {
      console.error('❌ PhishTank feed fetch failed:', error)
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch PhishTank feed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async fetchNVD(req: Request, res: Response) {
    try {
      console.log('🔒 Fetching NVD feed...')
      
      // Mock NVD data for testing (since NVD API is having issues)
      const mockCVEs = [
        {
          id: 'CVE-2025-1234',
          description: 'A critical buffer overflow vulnerability in widely-used web server software allows remote code execution.',
          cvssScore: 9.8,
          published: '2025-03-15T10:00:00.000'
        },
        {
          id: 'CVE-2025-5678', 
          description: 'SQL injection vulnerability in popular database management tool enables data theft.',
          cvssScore: 8.5,
          published: '2025-03-14T15:30:00.000'
        },
        {
          id: 'CVE-2025-9012',
          description: 'Cross-site scripting vulnerability in content management system affects user sessions.',
          cvssScore: 7.2,
          published: '2025-03-13T09:15:00.000'
        }
      ]
      
      console.log(`📊 Retrieved ${mockCVEs.length} CVEs from NVD (mock data)`)
      
      // Transform to Alert schema
      const alerts = mockCVEs.map((cve: any, index: number) => {
        const cveId = cve.id
        const description = cve.description
        const cvssScore = cve.cvssScore || 0
        
        return {
          id: `nvd-${cveId}-${Date.now()}-${index}`,
          title: `CVE Alert: ${cveId}`,
          description: `${description} CVSS Score: ${cvssScore}. Published: ${cve.published}`,
          category: 'CVE',
          severity: this.mapCVSSToSeverity(cvssScore),
          summary: `${cveId} vulnerability with CVSS ${cvssScore}`,
          suggested_action: 'Review and apply security patches if available',
          reason: 'High/Critical severity CVE published recently',
          confidence: 'high',
          source: 'NVD',
          location: 'Various systems',
          date: new Date(cve.published).toISOString().split('T')[0],
          resolved: false,
          affects_me: cvssScore >= 7.0,
          verification_count: 0,
          verification_status: 'pending'
        }
      })
      
      // Upsert to database
      const { prisma } = await import('../lib/db.js')
      
      const results = await Promise.all(
        alerts.map(async (alert: any) => {
          return await prisma.alert.upsert({
            where: { id: alert.id },
            create: alert,
            update: {
              title: alert.title,
              description: alert.description,
              severity: alert.severity,
              date: alert.date
            }
          })
        })
      )
      
      console.log(`✅ Upserted ${results.length} NVD alerts to database`)
      
      res.json({
        success: true,
        source: 'NVD (Mock Data)',
        retrieved: mockCVEs.length,
        processed: alerts.length,
        upserted: results.length,
        alerts: alerts.slice(0, 5) // Return sample for verification
      })
      
    } catch (error) {
      console.error('❌ NVD feed fetch failed:', error)
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch NVD feed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private mapCVSSToSeverity(cvssScore: number): string {
    if (cvssScore >= 9.0) return 'critical'
    if (cvssScore >= 7.0) return 'high'
    if (cvssScore >= 4.0) return 'medium'
    return 'low'
  }
}
