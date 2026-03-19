import type { Alert, AlertCategory } from '@/types/alert'

const STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'this', 'that', 'these', 'those', 'it',
    'its', 'via', 'your', 'their', 'our', 'not', 'no', 'can',
])

function extractKeywords(text: string): string[] {
    return text
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3 && !STOPWORDS.has(w))
}

export function findSimilarAlerts(
    category: AlertCategory,
    pastedText: string,
    alerts: Alert[],
    limit = 2
): Alert[] {
    const keywords = extractKeywords(pastedText)
    if (keywords.length === 0) return []

    return alerts
        .filter((a) => a.category === category)
        .map((a) => {
            const haystack = `${a.title} ${a.description}`.toLowerCase()
            const score = keywords.filter((k) => haystack.includes(k)).length
            return { alert: a, score }
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((x) => x.alert)
}