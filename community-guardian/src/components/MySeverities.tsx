'use client'

import { SEVERITIES, SEVERITY_STYLES } from '@/lib/constants'
import type { Severity } from '@/types/alert'

interface Props {
    selected: string[]
    onChange: (severities: string[]) => void
    saving?: boolean
}

export default function MySeverities({ selected, onChange, saving }: Props) {
    const toggle = (sev: string) => {
        if (selected.includes(sev)) {
            onChange(selected.filter((s) => s !== sev))
        } else {
            onChange([...selected, sev])
        }
    }

    return (
        <div className="space-y-3">
            <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Alert severity levels
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Filter alerts by severity level.
                    {selected.length === 0 && ' Select levels to focus on, or leave empty to see all severities.'}
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {SEVERITIES.map((sev) => {
                    const isSelected = selected.includes(sev)
                    return (
                        <button
                            key={sev}
                            onClick={() => toggle(sev)}
                            disabled={saving}
                            aria-pressed={isSelected}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium
                          border-2 transition-all
                          ${isSelected
                                    ? `${SEVERITY_STYLES[sev]} border-current scale-105`
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                                }
                          disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSelected && '✓ '}{sev.charAt(0).toUpperCase() + sev.slice(1)}
                        </button>
                    )
                })}
            </div>

            {selected.length > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                    Showing alerts with severity: {selected.join(', ')}
                </p>
            )}
        </div>
    )
}
