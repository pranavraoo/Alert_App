export type AlertSource =
  | 'CISA'
  | 'PhishTank'
  | 'NVD'
  | 'User'

export type AlertCategory =
  | 'Scam'
  | 'Phishing'
  | 'Imposter'
  | 'Data breach'
  | 'Local safety'
  | 'CVE'
  | 'Other'

export type Severity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export type Confidence = 'high' | 'low'

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
}

export interface Guardian {
  id: string
  name: string
  label?: string
  created_at: string
}

export interface UserPreference {
  id: string
  concerns: string[]
  theme: 'light' | 'dark' | 'system'
  quiet_start?: string
  quiet_end?: string
}

export interface AICategorizationResult {
  category: AlertCategory
  severity: Severity
  summary: string
  suggested_action: string
  reason: string
  confidence: Confidence
  used_fallback?: boolean
}