// Smart Category Matcher - Uses semantic matching instead of hardcoded magic strings

export interface CategoryProfile {
  name: string
  keywords: string[]
  patterns: RegExp[]
  concernMappings: string[] // What user concerns map to this category
  examples: string[]
}

const CATEGORY_PROFILES: CategoryProfile[] = [
  {
    name: 'Phishing',
    keywords: [
      'phishing', 'login', 'password', 'credential', 'account', 'verify', 'suspension',
      'click here', 'urgent', 'immediate action', 'security alert', 'unusual activity',
      'netflix', 'paypal', 'amazon', 'gmail', 'facebook', 'instagram', 'linkedin',
      'bank', 'credit card', 'payment', 'billing', 'subscription'
    ],
    patterns: [
      /click.*link/i,
      /verify.*account/i,
      /suspended.*account/i,
      /unusual.*activity/i,
      /security.*alert/i,
      /urgent.*action/i
    ],
    concernMappings: ['Phishing', 'Account Security', 'Email Safety', 'Financial Security'],
    examples: ['Fake Netflix suspension email', 'PayPal credential harvesting', 'Bank login phishing']
  },
  {
    name: 'Scam',
    keywords: [
      'scam', 'fraud', 'money', 'payment', 'wire', 'transfer', 'gift card', 'bitcoin',
      'cryptocurrency', 'investment', 'lottery', 'prize', 'winner', 'inheritance',
      'refund', 'tech support', 'microsoft', 'irs', 'social security', 'debt collection',
      'timeshare', 'charity', 'donation', 'scholarship', 'grant', 'loan', 'credit repair'
    ],
    patterns: [
      /send.*money/i,
      /wire.*transfer/i,
      /gift.*card/i,
      /pay.*fee/i,
      /guaranteed.*return/i,
      /act.*now/i,
      /limited.*time/i
    ],
    concernMappings: ['Scam', 'Financial Fraud', 'Consumer Protection', 'Investment Safety'],
    examples: ['Tech support scam', 'IRS impersonation', 'Cryptocurrency investment fraud']
  },
  {
    name: 'Imposter',
    keywords: [
      'impersonation', 'impersonating', 'fake', 'posing as', 'claiming to be', 'pretending',
      'government', 'agency', 'police', 'fbi', 'cia', 'irs', 'ssa', 'medicare', 'cdc',
      'utility company', 'electric', 'gas', 'water', 'phone company', 'bank',
      'delivery service', 'fedex', 'ups', 'usps', 'dhl', 'court', 'jury duty'
    ],
    patterns: [
      /claiming.*to be/i,
      /pretending.*to be/i,
      /fake.*official/i,
      /impersonating/i,
      /calling.*from/i
    ],
    concernMappings: ['Imposter', 'Government Safety', 'Identity Protection', 'Official Communications'],
    examples: ['IRS impersonation scam', 'Fake police calls', 'Utility company fraud']
  },
  {
    name: 'Data breach',
    keywords: [
      'breach', 'hack', 'leaked', 'compromised', 'exposed', 'stolen', 'data breach',
      'personal information', 'social security', 'credit card', 'account numbers',
      'database', 'system', 'network', 'ransomware', 'cyberattack', 'security incident',
      'customer data', 'patient records', 'student records', 'employee information'
    ],
    patterns: [
      /data.*breach/i,
      /information.*exposed/i,
      /system.*compromised/i,
      /ransomware/i,
      /cyber.*attack/i,
      /unauthorized.*access/i
    ],
    concernMappings: ['Data breach', 'Privacy Protection', 'Identity Theft', 'Cybersecurity'],
    examples: ['Hospital data breach', 'Credit card processor hack', 'University records exposed']
  },
  {
    name: 'Local safety',
    keywords: [
      'local', 'neighborhood', 'community', 'area', 'district', 'downtown', 'residential',
      'burglary', 'theft', 'break-in', 'car theft', 'package theft', 'suspicious',
      'person', 'vehicle', 'activity', 'parking', 'garage', 'school', 'park', 'library',
      'police', 'emergency', 'safety', 'warning', 'alert', 'evacuation'
    ],
    patterns: [
      /suspicious.*person/i,
      /vehicle.*theft/i,
      /break.*in/i,
      /package.*theft/i,
      /local.*safety/i,
      /community.*alert/i
    ],
    concernMappings: ['Local safety', 'Community Safety', 'Neighborhood Watch', 'Personal Safety'],
    examples: ['Car theft pattern', 'Suspicious person near school', 'Package theft spike']
  },
  {
    name: 'CVE',
    keywords: [
      'cve', 'vulnerability', 'exploit', 'patch', 'update', 'security', 'flaw', 'bug',
      'remote code execution', 'privilege escalation', 'zero-day', 'advisory', 'bulletin',
      'apache', 'microsoft', 'oracle', 'cisco', 'vmware', 'adobe', 'linux', 'windows',
      'chrome', 'firefox', 'safari', 'android', 'ios', 'software', 'application'
    ],
    patterns: [
      /cve-\d{4}-\d+/i,
      /remote.*code.*execution/i,
      /privilege.*escalation/i,
      /zero.*day/i,
      /security.*vulnerability/i,
      /critical.*patch/i
    ],
    concernMappings: ['CVE', 'Software Security', 'Vulnerability Management', 'IT Security'],
    examples: ['Apache Log4j vulnerability', 'Windows zero-day', 'Chrome security flaw']
  }
]

export class SmartCategoryMatcher {
  /**
   * Match user concerns to actual categories using semantic analysis
   */
  static matchConcernsToCategories(userConcerns: string[]): string[] {
    if (!userConcerns || userConcerns.length === 0) {
      return []
    }

    const matchedCategories = new Set<string>()
    const normalizedConcerns = userConcerns.map(c => c.toLowerCase().trim())

    // Direct concern mapping
    for (const concern of normalizedConcerns) {
      for (const profile of CATEGORY_PROFILES) {
        if (profile.concernMappings.some(mapping => 
          mapping.toLowerCase() === concern || 
          mapping.toLowerCase().includes(concern) ||
          concern.includes(mapping.toLowerCase())
        )) {
          matchedCategories.add(profile.name)
        }
      }
    }

    // Semantic matching using keywords
    for (const concern of normalizedConcerns) {
      for (const profile of CATEGORY_PROFILES) {
        const concernWords = concern.split(/\s+/)
        const matchingKeywords = profile.keywords.filter(keyword => 
          concernWords.some(word => 
            keyword.toLowerCase().includes(word) || 
            word.includes(keyword.toLowerCase())
          )
        )
        
        // If concern matches multiple keywords of a category, it's likely a match
        if (matchingKeywords.length >= 2) {
          matchedCategories.add(profile.name)
        }
      }
    }

    // Pattern matching for complex concerns
    for (const concern of normalizedConcerns) {
      for (const profile of CATEGORY_PROFILES) {
        if (profile.patterns.some(pattern => pattern.test(concern))) {
          matchedCategories.add(profile.name)
        }
      }
    }

    return Array.from(matchedCategories)
  }

  /**
   * Get category profile by name
   */
  static getCategoryProfile(categoryName: string): CategoryProfile | undefined {
    return CATEGORY_PROFILES.find(profile => profile.name === categoryName)
  }

  /**
   * Get all available categories
   */
  static getAllCategories(): string[] {
    return CATEGORY_PROFILES.map(profile => profile.name)
  }

  /**
   * Suggest categories based on text content (for categorization)
   */
  static suggestCategories(text: string): { category: string; confidence: number }[] {
    const normalizedText = text.toLowerCase()
    const suggestions: { category: string; confidence: number }[] = []

    for (const profile of CATEGORY_PROFILES) {
      let score = 0
      const words = normalizedText.split(/\s+/)

      // Keyword matching
      const keywordMatches = profile.keywords.filter(keyword => 
        normalizedText.includes(keyword.toLowerCase())
      )
      score += keywordMatches.length * 2

      // Pattern matching
      const patternMatches = profile.patterns.filter(pattern => pattern.test(normalizedText))
      score += patternMatches.length * 3

      // Exact category name match
      if (normalizedText.includes(profile.name.toLowerCase())) {
        score += 5
      }

      if (score > 0) {
        const confidence = Math.min(score / 20, 1) // Normalize to 0-1
        suggestions.push({ category: profile.name, confidence })
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Get smart 1-2-3 steps for a category
   */
  static getCategorySteps(categoryName: string): string[] {
    const profile = this.getCategoryProfile(categoryName)
    if (!profile) {
      return ['Verify the information through official sources.', 'Report to relevant authorities if needed.', 'Monitor for related suspicious activity.']
    }
    return profile.examples.map((example, index) => 
      `${index + 1}. ${example}`
    )
  }
}
