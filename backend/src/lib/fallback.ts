import type { AICategorizationResult, AlertCategory, Severity } from '../types/alert.js'

const KEYWORDS: Record<string, string[]> = {
  'Suspicious Activity': [
    'phishing', 'click here', 'verify account', 'login link', 'credentials', 
    'scam', 'prize', 'winner', 'send money', 'wire transfer', 'lottery', 'gift card',
    'imposter', 'irs', 'microsoft support', 'police', 'prowler', 'suspicious'
  ],
  'Infrastructure': [
    'infrastructure', 'pothole', 'broken light', 'water leak', 'power outage', 'damage', 'road'
  ],
  'Safety': [
    'robbery', 'fire', 'accident', 'missing person', 'shooting', 'flood', 'evacuation', 'incident report', 'threat'
  ],
  'Noise': [
    'noise', 'loud party', 'loud music', 'construction', 'dogs barking'
  ],
  'Other': [],
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
    category: best.category,
    severity,
    summary: 'Classification fallback applied; please verify.',
    suggested_action: 'Review the details and verify category and severity.',
    reason,
    confidence: 'low',
  }
}

