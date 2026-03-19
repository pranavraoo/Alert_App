'use client'

import { useState } from 'react'
import type { AlertSource } from '@/types/alert'

interface Props {
    alertId: string
    source: AlertSource
    affectsMe: boolean
    onToggle: (val: boolean) => void
}

export default function AffectsMe({ alertId, source, affectsMe, onToggle }: Props) {
    // Only show for CISA and NVD
    if (source !== 'CISA' && source !== 'NVD') return null

    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        setLoading(true)
        onToggle(!affectsMe)
        setLoading(false)
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            aria-label={affectsMe ? 'Mark as not affecting me' : 'Mark as affecting me'}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg
                  border font-medium transition-colors
                  ${affectsMe
                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }
                  disabled:opacity-50`}
        >
            {affectsMe ? '✓ Affects me' : '+ This affects me'}
        </button>
    )
}