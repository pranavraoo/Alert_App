'use client'

import Link from 'next/link'
import type { Alert } from '@/types/alert'
import ThreatDNA from './ThreatDNA'
import {
    SEVERITY_STYLES,
    SOURCE_STYLES,
    CATEGORY_STYLES,
} from '@/lib/constants'

interface Props {
    alert: Alert
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    } catch {
        return dateStr
    }
}

export default function AlertCard({ alert }: Props) {
    return (
        <article
            aria-label={`${alert.title}, ${alert.category}, ${alert.severity} severity`}
            className={`
        group bg-white dark:bg-slate-800
        rounded-xl border border-slate-200 dark:border-slate-700
        p-4 hover:shadow-md transition-shadow duration-200
        ${alert.resolved ? 'opacity-60' : ''}
      `}
        >
            {/* Top row — DNA + title + resolved badge */}
            <div className="flex items-start gap-3">
                <ThreatDNA alert={alert} size="sm" />

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100
                           line-clamp-2 group-hover:text-blue-600
                           dark:group-hover:text-blue-400 transition-colors">
                            {alert.title}
                        </h2>
                        {alert.resolved && (
                            <span className="flex-shrink-0 badge bg-slate-100 text-slate-500
                               dark:bg-slate-700 dark:text-slate-400">
                                Resolved
                            </span>
                        )}
                        {alert.affects_me && !alert.resolved && (
                            <span className="flex-shrink-0 badge bg-blue-100 text-blue-700
                               dark:bg-blue-900 dark:text-blue-300">
                                Affects me
                            </span>
                        )}
                    </div>

                    {/* Summary or description preview */}
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {alert.summary || alert.description}
                    </p>
                </div>
            </div>

            {/* Badge row */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className={`badge ${CATEGORY_STYLES[alert.category]}`}>
                    {alert.category}
                </span>
                <span className={`badge ${SEVERITY_STYLES[alert.severity]}`}>
                    {alert.severity}
                </span>
                <span className={`badge ${SOURCE_STYLES[alert.source]}`}>
                    {alert.source}
                </span>
                {alert.location && (
                    <span className="badge bg-slate-100 text-slate-600
                           dark:bg-slate-700 dark:text-slate-300">
                        📍 {alert.location}
                    </span>
                )}
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(alert.date)}
                </span>
            </div>

            {/* CTA */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <Link
                    href={`/alerts/${alert.id}`}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400
                     hover:underline focus:outline-none focus:underline"
                >
                    View details →
                </Link>
            </div>
        </article>
    )
}