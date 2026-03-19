export type AlertCategory = 'Phishing' | 'Scam' | 'Imposter' | 'Data breach' | 'Local safety' | 'CVE' | 'Other'
export type Severity = 'low' | 'medium' | 'high' | 'critical'

export interface AICategorizationResult {
  title: string
  category: AlertCategory
  severity: Severity
  summary: string
  suggested_action: string
  reason: string
  confidence: 'low' | 'medium' | 'high'
}

const KEYWORDS: Record<AlertCategory, string[]> = {
  Phishing: [
    'phishing',
    'click here',
    'verify account',
    'login link',
    'credentials',
    'confirm your',
    'update your password',
  ],
  Scam: [
    'prize',
    'winner',
    'send money',
    'wire transfer',
    'lottery',
    'gift card',
    'congratulations',
    'claim your',
  ],
  Imposter: [
    'irs',
    'social security',
    'microsoft support',
    'police',
    'government',
    'impersonat',
    'official notice',
  ],
  'Data breach': [
    'breach',
    'leaked',
    'compromised',
    'stolen data',
    'exposed',
    'database',
    'personal information',
    'unauthorised access',
    'unauthorized access',
  ],
  'Local safety': [
    'robbery',
    'fire',
    'accident',
    'missing person',
    'shooting',
    'flood',
    'evacuation',
    'incident report',
  ],
  CVE: [
    'cve-',
    'vulnerability',
    'exploit',
    'patch',
    'zero-day',
    'rce',
    'remote code execution',
    'security advisory',
  ],
  Other: [],
}

const URGENCY_RE = /urgent|asap|immediately|right now|act now|time sensitive/i

function bumpSeverity(sev: Severity): Severity {
  if (sev === 'critical') return 'critical'
  if (sev === 'high') return 'high'
  return 'high'
}

export function fallbackCategorize(text: string): AICategorizationResult {
  const t = text.toLowerCase()

  let best: { category: AlertCategory; matches: string[] } = {
    category: 'Other',
    matches: [],
  }

  for (const [category, words] of Object.entries(KEYWORDS) as Array<
    [AlertCategory, string[]]
  >) {
    const matches = words.filter((w) => t.includes(w))
    if (matches.length > best.matches.length) best = { category, matches }
  }

  let severity: Severity = 'medium'
  if (URGENCY_RE.test(text)) severity = bumpSeverity(severity)

  const reason =
    best.matches.length > 0
      ? `Matched keywords: ${best.matches.slice(0, 3).join(', ')}`
      : 'No clear category keywords matched'

  return {
    title: text.slice(0, 50).trim() + (text.length > 50 ? '...' : ''),
    category: best.category,
    severity,
    summary: 'Classification fallback applied; please verify.',
    suggested_action: 'Review the details and verify category and severity.',
    reason,
    confidence: 'low',
  }
}
