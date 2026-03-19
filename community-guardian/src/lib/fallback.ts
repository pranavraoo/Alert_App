import type {
    AlertCategory,
    Severity,
    AICategorizationResult,
} from '@/types/alert'

const KEYWORDS: Record<AlertCategory, string[]> = {
    'Phishing': ['phishing', 'click here', 'verify account', 'login link', 'credentials', 'confirm your', 'update your password'],
    'Scam': ['prize', 'winner', 'send money', 'wire transfer', 'lottery', 'gift card', 'congratulations', 'claim your'],
    'Imposter': ['irs', 'social security', 'microsoft support', 'police', 'government', 'impersonat', 'official notice'],
    'Data breach': ['breach', 'leaked', 'compromised', 'stolen data', 'exposed', 'database', 'personal information', 'unauthorized'],
    'Local safety': ['robbery', 'fire', 'accident', 'missing', 'shooting', 'flood', 'evacuation', 'incident'],
    'CVE': ['cve-', 'vulnerability', 'exploit', 'patch', 'zero-day', 'rce', 'remote code'],
    'Other': [],
}

const URGENCY = /urgent|asap|immediately|right now|act now|time sensitive/i

export function fallbackCategorize(text: string): AICategorizationResult {
    const lower = text.toLowerCase()

    let bestCategory: AlertCategory = 'Other'
    let bestScore = 0
    const matchedKeywords: string[] = []

    for (const [cat, keywords] of Object.entries(KEYWORDS) as [AlertCategory, string[]][]) {
        const matched = keywords.filter((k) => lower.includes(k))
        if (matched.length > bestScore) {
            bestScore = matched.length
            bestCategory = cat
            matchedKeywords.push(...matched)
        }
    }

    const isUrgent = URGENCY.test(text)
    const severity: Severity =
        isUrgent ? 'high' :
            bestScore > 2 ? 'medium' : 'low'

    return {
        category: bestCategory,
        severity,
        summary: 'Please verify this alert manually.',
        suggested_action: 'Check official sources before taking action.',
        reason: matchedKeywords.length
            ? `Matched keywords: ${matchedKeywords.slice(0, 3).join(', ')}`
            : 'No strong keyword match found.',
        confidence: 'low',
    }
}