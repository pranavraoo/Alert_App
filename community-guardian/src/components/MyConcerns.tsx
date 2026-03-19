'use client'

import { CATEGORIES } from '@/lib/constants'
import { CATEGORY_STYLES } from '@/lib/constants'
import type { AlertCategory } from '@/types/alert'

interface Props {
    selected: string[]
    onChange: (concerns: string[]) => void
    saving?: boolean
}

export default function MyConcerns({ selected, onChange, saving }: Props) {
    const toggle = (cat: string) => {
        if (selected.includes(cat)) {
            onChange(selected.filter((c) => c !== cat))
        } else {
            onChange([...selected, cat])
        }
    }

    return (
        <div className="space-y-3">
            <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    What matters to you?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your digest will prioritise these categories.
                    {selected.length === 0 && ' Select at least one, or leave empty to see everything.'}
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                    const isSelected = selected.includes(cat)
                    return (
                        <button
                            key={cat}
                            onClick={() => toggle(cat)}
                            disabled={saving}
                            aria-pressed={isSelected}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium
                          border-2 transition-all
                          ${isSelected
                                    ? `${CATEGORY_STYLES[cat as AlertCategory]} border-current scale-105`
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                                }
                          disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSelected && '✓ '}{cat}
                        </button>
                    )
                })}
            </div>

            {selected.length > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                    Showing digest for: {selected.join(', ')}
                </p>
            )}
        </div>
    )
}