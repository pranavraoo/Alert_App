export type AlertSource = 'CISA' | 'PhishTank' | 'NVD' | 'User'

export type AlertCategory =
  | 'Scam'
  | 'Phishing'
  | 'Imposter'
  | 'Data breach'
  | 'Local safety'
  | 'CVE'
  | 'Other'

export type Severity = 'low' | 'medium' | 'high' | 'critical'

export type Confidence = 'high' | 'low'

export interface AICategorizationResult {
  category: AlertCategory
  severity: Severity
  summary: string
  suggested_action: string
  reason: string
  confidence: Confidence
}

