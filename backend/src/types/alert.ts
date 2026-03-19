export type AlertSource = 'CISA' | 'PhishTank' | 'NVD' | 'User'

export type AlertCategory = string // Support dynamic categories while maintaining compatibility

export type Severity = 'low' | 'medium' | 'high' | 'critical'

export type Confidence = 'high' | 'low'

export interface AICategorizationResult {
  title: string // AI-generated catchy title
  category: AlertCategory
  severity: Severity
  summary: string
  suggested_action: string
  reason: string
  confidence: Confidence
}

export interface Alert {
  id: string
  title: string
  description: string
  category: AlertCategory
  severity: Severity
  summary: string
  suggested_action: string
  reason: string
  confidence: Confidence
  source: AlertSource
  location?: string
  date: string
  resolved: boolean
  affects_me: boolean
  created_at: string
  verification_count?: number
  verification_status?: 'pending' | 'verified' | 'fake' | 'disputed'
  verification_breakdown?: Record<string, number>
}

