'use client'

import { useState } from 'react'
import { CHECKLISTS } from '@/lib/constants'
import type { AlertCategory } from '@/types/alert'

interface Props {
    category: AlertCategory
    onAllChecked?: () => void
    checked?: boolean[]
    onToggle?: (index: number) => void
}

export default function CategoryChecklist({ category, onAllChecked, checked: propsChecked, onToggle }: Props) {
    const steps = CHECKLISTS[category] ?? CHECKLISTS['Other']
    const [internalChecked, setInternalChecked] = useState<boolean[]>(steps.map(() => false))

    const isControlled = propsChecked !== undefined && onToggle !== undefined
    const checked = isControlled ? propsChecked : internalChecked

    const toggle = (i: number) => {
        if (isControlled) {
            onToggle(i)
        } else {
            const next = internalChecked.map((v, idx) => (idx === i ? !v : v))
            setInternalChecked(next)
            if (next.every(Boolean)) onAllChecked?.()
        }
    }

    return (
        <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400
                   uppercase tracking-wide">
                What to do
            </p>
            <ol className="space-y-2">
                {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <button
                            onClick={() => toggle(i)}
                            aria-label={`${checked[i] ? 'Uncheck' : 'Check'} step ${i + 1}`}
                            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2
                          flex items-center justify-center transition-colors
                          ${checked[i]
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-green-400'
                                }`}
                        >
                            {checked[i] && <span className="text-xs">✓</span>}
                        </button>
                        <span className={`text-sm leading-relaxed
              ${checked[i]
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            {i + 1}. {step}
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    )
}