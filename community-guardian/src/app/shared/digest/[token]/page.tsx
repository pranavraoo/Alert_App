'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import ThreatDNA from '@/components/ThreatDNA'
import CategoryChecklist from '@/components/CategoryChecklist'
import {
    SEVERITY_STYLES,
    SOURCE_STYLES,
    CATEGORY_STYLES,
} from '@/lib/constants'
import type { Alert } from '@/types/alert'

export default function SharedAlertPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const [alert, setAlert] = useState<Alert | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadAlert = async () => {
            try {
                const response = await apiClient.getAlert(id)
                if (response.error) {
                    console.error('Failed to load alert:', response.error)
                    setAlert(null)
                } else {
                    setAlert(response.data)
                }
            } catch (error) {
                console.error('Error loading alert:', error)
                setAlert(null)
            } finally {
                setLoading(false)
            }
        }

        loadAlert()
    }, [id])

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="skeleton h-64 w-full rounded-xl" />
            </div>
        )
    }

    if (!alert) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <p className="text-slate-500 dark:text-slate-400">Alert not found</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-4">

            {/* Header */}
            <div className="text-center py-4 space-y-1">
                <p className="text-2xl">🛡️</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    This alert was shared with you · Community Guardian
                </p>
            </div>

            {/* Alert card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <div className="flex items-start gap-4">
                    <ThreatDNA alert={alert} size="lg" />
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {alert.title}
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            {new Date(alert.date).toLocaleDateString('en-US', {
                                month: 'long', day: 'numeric', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

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

                {alert.summary && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {alert.summary}
                    </p>
                )}

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {alert.description}
                </p>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                    <CategoryChecklist category={alert.category} />
                </div>

                {alert.suggested_action && (
                    <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30
                          border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            💡 {alert.suggested_action}
                        </p>
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className="text-center">
                <Link
                    href="/"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Create your own Community Guardian →
                </Link>
            </div>
        </div>
    )
}