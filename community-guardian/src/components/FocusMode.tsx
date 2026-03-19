'use client'

import { useState } from 'react'
import type { Alert } from '@/types/alert'
import ThreatDNA from './ThreatDNA'
import CategoryChecklist from './CategoryChecklist'
import Link from 'next/link'
import {
    SEVERITY_STYLES,
    SOURCE_STYLES,
    CATEGORY_STYLES,
} from '@/lib/constants'

interface Props {
    alerts: Alert[]
    onClose: () => void
}

export default function FocusMode({ alerts, onClose }: Props) {
    const [index, setIndex] = useState(0)

    if (alerts.length === 0) {
        return (
            <div className="text-center py-16 space-y-3">
                <p className="text-4xl">✓</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Nothing to focus on right now
                </p>
                <button
                    onClick={onClose}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Back to digest
                </button>
            </div>
        )
    }

    const alert = alerts[index]
    const total = alerts.length
    const isFirst = index === 0
    const isLast = index === total - 1

    return (
        <div className="space-y-4">

            {/* Progress + close */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="text-sm text-slate-500 dark:text-slate-400
                       hover:text-slate-700 dark:hover:text-slate-200
                       transition-colors"
                    >
                        ← Exit focus
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        {index + 1} of {total}
                    </span>
                </div>

                {/* Progress dots */}
                <div className="flex gap-1">
                    {alerts.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            aria-label={`Go to alert ${i + 1}`}
                            className={`w-2 h-2 rounded-full transition-colors
                ${i === index
                                    ? 'bg-blue-500'
                                    : i < index
                                        ? 'bg-green-400'
                                        : 'bg-slate-200 dark:bg-slate-600'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Alert card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-6 space-y-4">

                {/* DNA + title */}
                <div className="flex items-start gap-4">
                    <ThreatDNA alert={alert} size="lg" />
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100
                           leading-snug">
                            {alert.title}
                        </h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {new Date(alert.date).toLocaleDateString('en-US', {
                                month: 'long', day: 'numeric', year: 'numeric'
                            })}
                            {alert.location ? ` · ${alert.location}` : ''}
                        </p>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                    <span className={`badge ${CATEGORY_STYLES[alert.category]}`}>
                        {alert.category}
                    </span>
                    <span className={`badge ${SEVERITY_STYLES[alert.severity]}`}>
                        {alert.severity}
                    </span>
                    <span className={`badge ${SOURCE_STYLES[alert.source]}`}>
                        {alert.source}
                    </span>
                </div>

                {/* Summary */}
                {alert.summary && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {alert.summary}
                    </p>
                )}

                {/* Checklist */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                    <CategoryChecklist category={alert.category} />
                </div>

                {/* Suggested action */}
                {alert.suggested_action && (
                    <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30
                          border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            💡 {alert.suggested_action}
                        </p>
                    </div>
                )}

                {/* View full */}
                <Link
                    href={`/alerts/${alert.id}`}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View full details →
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                <button
                    onClick={() => setIndex((i) => Math.max(0, i - 1))}
                    disabled={isFirst}
                    className="flex-1 py-2 text-sm font-medium rounded-lg
                     border border-slate-200 dark:border-slate-600
                     text-slate-600 dark:text-slate-400
                     hover:bg-slate-50 dark:hover:bg-slate-700
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors"
                >
                    ← Previous
                </button>

                {isLast ? (
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 text-sm font-medium rounded-lg
                       bg-green-600 text-white hover:bg-green-700
                       transition-colors"
                    >
                        ✓ All done
                    </button>
                ) : (
                    <button
                        onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
                        className="flex-1 py-2 text-sm font-medium rounded-lg
                       bg-blue-600 text-white hover:bg-blue-700
                       transition-colors"
                    >
                        Next →
                    </button>
                )}
            </div>
        </div>
    )
}