// Smart category matching for dynamic categories
export interface CategoryMatch {
  category: string
  confidence: number
  matchedKeywords: string[]
}

// Base categories with their semantic meanings and keywords
const BASE_CATEGORY_SEMANTICS = {
  'Scam': [
    'scam', 'fraud', 'fake', 'deceptive', 'misleading', 'con', 'scheme', 'trick', 'hoax'
  ],
  'Phishing': [
    'phishing', 'phish', 'credential', 'login', 'password', 'account', 'verify', 'authenticate'
  ],
  'Imposter': [
    'imposter', 'impersonating', 'fake', 'pretending', 'posing', 'masquerading', 'microsoft', 'google', 'apple'
  ],
  'Data breach': [
    'breach', 'leak', 'exposed', 'compromised', 'stolen', 'data', 'information', 'personal'
  ],
  'Local safety': [
    'local', 'safety', 'area', 'neighborhood', 'community', 'physical', 'in-person', 'location'
  ],
  'CVE': [
    'cve', 'vulnerability', 'exploit', 'security', 'patch', 'update', 'software', 'system'
  ],
  'Other': [] // fallback
}

// Enhanced semantic matching with more sophisticated patterns
const ENHANCED_PATTERNS = {
  // Financial scams
  'Scam': [
    'cryptocurrency', 'bitcoin', 'investment', 'returns', 'guaranteed', 'quick money',
    'wire transfer', 'western union', 'money gram', 'gift card', 'payment'
  ],
  
  // Account security threats
  'Phishing': [
    'suspended', 'suspension', 'verify', 'confirm', 'update', 'security', 'urgent',
    'click here', 'immediate action', 'account locked'
  ],
  
  // Brand impersonation
  'Imposter': [
    'microsoft', 'apple', 'google', 'amazon', 'paypal', 'facebook', 'instagram',
    'bank of america', 'chase', 'wells fargo', 'irs', 'social security'
  ],
  
  // Data security incidents
  'Data breach': [
    'database', 'hack', 'leaked', 'exposed', 'customer data', 'personal information',
    'credit card', 'social security', 'identity theft'
  ],
  
  // Physical threats
  'Local safety': [
    'park', 'street', 'neighborhood', 'suspicious person', 'vehicle', 'activity',
    'local', 'area', 'community'
  ],
  
  // Technical vulnerabilities
  'CVE': [
    'vulnerability', 'cve-', 'exploit', 'zero-day', 'security update', 'patch',
    'software', 'system', 'application', 'malware', 'virus'
  ]
}

/**
 * Match a dynamic category to base categories using semantic analysis
 */
export function matchDynamicCategory(dynamicCategory: string): CategoryMatch[] {
  const normalized = dynamicCategory.toLowerCase()
  const matches: CategoryMatch[] = []

  // Check each base category for semantic matches
  Object.entries(ENHANCED_PATTERNS).forEach(([baseCategory, keywords]) => {
    const matchedKeywords: string[] = []
    let confidence = 0

    // Direct keyword matching
    keywords.forEach(keyword => {
      if (normalized.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword)
        confidence += 0.3
      }
    })

    // Partial matching for longer keywords
    keywords.forEach(keyword => {
      if (keyword.length > 6) {
        const parts = keyword.split(' ')
        parts.forEach(part => {
          if (part.length > 3 && normalized.includes(part.toLowerCase())) {
            confidence += 0.1
          }
        })
      }
    })

    // Exact match bonus
    if (normalized === baseCategory.toLowerCase()) {
      confidence = 1.0
    }

    // High similarity bonus
    if (normalized.includes(baseCategory.toLowerCase()) || baseCategory.toLowerCase().includes(normalized)) {
      confidence += 0.5
    }

    if (confidence > 0) {
      matches.push({
        category: baseCategory,
        confidence: Math.min(confidence, 1.0),
        matchedKeywords
      })
    }
  })

  // Sort by confidence and return top matches
  return matches.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Check if a dynamic category matches user's concerns
 */
export function matchesConcern(dynamicCategory: string, userConcerns: string[]): boolean {
  if (userConcerns.length === 0) return true // Show everything if no concerns

  const matches = matchDynamicCategory(dynamicCategory)
  
  // Check if any matched category is in user concerns
  return matches.some(match => 
    userConcerns.some(concern => 
      match.category === concern || 
      dynamicCategory.toLowerCase().includes(concern.toLowerCase()) ||
      concern.toLowerCase().includes(dynamicCategory.toLowerCase())
    )
  )
}

/**
 * Get all unique dynamic categories from alerts
 */
export function getUniqueDynamicCategories(alerts: any[]): string[] {
  const categories = alerts.map(alert => alert.category).filter(Boolean)
  return [...new Set(categories)]
}

/**
 * Suggest concerns based on available dynamic categories
 */
export function suggestConcerns(dynamicCategories: string[]): string[] {
  const suggestions: string[] = []
  const categoryCounts: Record<string, number> = {}

  // Count matches to base categories
  dynamicCategories.forEach(dynamicCat => {
    const matches = matchDynamicCategory(dynamicCat)
    matches.forEach(match => {
      categoryCounts[match.category] = (categoryCounts[match.category] || 0) + 1
    })
  })

  // Sort by frequency and return top suggestions
  return Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category]) => category)
}

/**
 * Enhanced concern matching that handles dynamic categories intelligently
 */
export function filterAlertsByConcerns(alerts: any[], userConcerns: string[]): any[] {
  if (userConcerns.length === 0) return alerts

  return alerts.filter(alert => {
    // Direct category match
    if (userConcerns.includes(alert.category)) return true

    // Semantic match through dynamic category matching
    if (matchesConcern(alert.category, userConcerns)) return true

    return false
  })
}
