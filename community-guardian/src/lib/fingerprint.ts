import type { Alert, AlertCategory, Severity, AlertSource } from '@/types/alert'

// Deterministic hash 0-255 from string
function simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xff
    }
    return Math.abs(hash)
}

// Shape per category
const SHAPES: Record<AlertCategory, string> = {
    'Phishing': 'circle',
    'Scam': 'diamond',
    'Imposter': 'hexagon',
    'Data breach': 'square',
    'Local safety': 'shield',
    'CVE': 'triangle',
    'Other': 'dot',
}

// Base colour per severity
const COLORS: Record<Severity, string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
}

// Pattern overlay per source
const PATTERNS: Record<AlertSource, string> = {
    CISA: 'horizontal',
    PhishTank: 'diagonal',
    NVD: 'grid',
    User: 'dots',
}

function getShape(
    shape: string,
    color: string,
    size: number,
    opacity = 1
): string {
    const s = size
    const c = s / 2
    const r = s * 0.38

    switch (shape) {
        case 'circle':
            return `<circle cx="${c}" cy="${c}" r="${r}" fill="${color}" opacity="${opacity}"/>`
        case 'diamond':
            return `<polygon points="${c},${r} ${s - r},${c} ${c},${s - r} ${r},${c}" fill="${color}" opacity="${opacity}"/>`
        case 'hexagon': {
            const pts = Array.from({ length: 6 }, (_, i) => {
                const a = (Math.PI / 3) * i - Math.PI / 6
                return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`
            }).join(' ')
            return `<polygon points="${pts}" fill="${color}" opacity="${opacity}"/>`
        }
        case 'square':
            return `<rect x="${r}" y="${r}" width="${s - r * 2}" height="${s - r * 2}" fill="${color}" opacity="${opacity}"/>`
        case 'triangle': {
            const pts = `${c},${r} ${s - r},${s - r} ${r},${s - r}`
            return `<polygon points="${pts}" fill="${color}" opacity="${opacity}"/>`
        }
        case 'shield':
            return `<path d="${`M${c},${r} L${s - r},${c * 0.85} L${s - r},${c * 1.2} Q${c},${s - r} ${r},${c * 1.2} L${r},${c * 0.85} Z`}" fill="${color}" opacity="${opacity}"/>`
        default:
            return `<circle cx="${c}" cy="${c}" r="${r * 0.6}" fill="${color}" opacity="${opacity}"/>`
    }
}

function getPatternDef(pattern: string, color: string, id: string): string {
    switch (pattern) {
        case 'horizontal':
            return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="4" height="4">
        <line x1="0" y1="2" x2="4" y2="2" stroke="${color}" stroke-width="0.8" opacity="0.4"/>
      </pattern>`
        case 'diagonal':
            return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="4" height="4">
        <line x1="0" y1="4" x2="4" y2="0" stroke="${color}" stroke-width="0.8" opacity="0.4"/>
      </pattern>`
        case 'grid':
            return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="4" height="4">
        <line x1="0" y1="2" x2="4" y2="2" stroke="${color}" stroke-width="0.6" opacity="0.3"/>
        <line x1="2" y1="0" x2="2" y2="4" stroke="${color}" stroke-width="0.6" opacity="0.3"/>
      </pattern>`
        case 'dots':
            return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="4" height="4">
        <circle cx="2" cy="2" r="0.8" fill="${color}" opacity="0.4"/>
      </pattern>`
        default:
            return ''
    }
}

export function generateFingerprint(alert: Alert, size = 24): string {
    const hash = simpleHash(alert.title)
    const shape = SHAPES[alert.category] ?? 'dot'
    const color = COLORS[alert.severity] ?? '#94a3b8'
    const pattern = PATTERNS[alert.source] ?? 'dots'
    const rotation = hash % 20
    const patId = `p-${alert.id.slice(0, 8)}`
    const patDef = getPatternDef(pattern, color, patId)
    const mainShape = getShape(shape, color, size)
    const overlayShape = patDef
        ? getShape(shape, `url(#${patId})`, size, 1)
        : ''

    return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"
    style="transform: rotate(${rotation}deg)">
    ${patDef ? `<defs>${patDef}</defs>` : ''}
    ${mainShape}
    ${overlayShape}
  </svg>`
}