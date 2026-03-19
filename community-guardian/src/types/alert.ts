export type AlertSource =
  | 'CISA'
  | 'PhishTank'
  | 'NVD'
  | 'User'

export type AlertCategory = string 

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
  verification_count?: number
  verification_status?: 'pending' | 'verified' | 'fake' | 'disputed'
  verification_breakdown?: Record<string, number>
  distance?: number
  within_radius?: boolean
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
  severities: string[]
  theme: 'light' | 'dark' | 'system'
  quiet_start?: string
  quiet_end?: string
  user_location?: string
  user_coordinates?: { lat: number; lng: number }
  location_radius?: number
  location_enabled?: boolean
}

export interface AICategorizationResult {
  title: string 
  category: AlertCategory
  severity: Severity
  summary: string
  suggested_action: string
  reason: string
  confidence: Confidence
  used_fallback?: boolean
}