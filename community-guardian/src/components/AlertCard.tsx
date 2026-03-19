'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { apiClient } from '@/lib/api-client'
import type { Alert } from '@/types/alert'
import ThreatDNA from './ThreatDNA'
import LocationBadge from './LocationBadge'
import AffectsMe from './AffectsMe'
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
    const updateAlert = useStore((s) => s.updateAlert)
    const alerts = useStore((s) => s.alerts)
    
    // Get the current alert from store to ensure we have the latest state
    const currentAlert = alerts.find(a => a.id === alert.id) || alert
    const [localAffectsMe, setLocalAffectsMe] = useState(currentAlert.affects_me || false)

    const handleAffectsMeToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        const newAffectsMe = !localAffectsMe
        setLocalAffectsMe(newAffectsMe)
        
        // Update the alert in the store immediately for responsive UI
        updateAlert(alert.id, { affects_me: newAffectsMe })
        
        // Persist to backend
        try {
            await apiClient.updateAlert(alert.id, { affects_me: newAffectsMe })
        } catch (error) {
            console.error('Failed to update affects_me status:', error)
            // Revert local change if backend update fails
            setLocalAffectsMe(!newAffectsMe)
            updateAlert(alert.id, { affects_me: !newAffectsMe })
        }
    }

    // Update local state when alert data changes in store
    const latestAlert = alerts.find(a => a.id === alert.id)
    useEffect(() => {
        if (latestAlert && latestAlert.affects_me !== localAffectsMe) {
            setLocalAffectsMe(latestAlert.affects_me || false)
        }
    }, [latestAlert, localAffectsMe])

    return (
        <Link href={`/alerts/${alert.id}`}>
            <article
                aria-label={`${alert.title}, ${alert.category}, ${alert.severity} severity`}
                className={`
        group bg-white dark:bg-slate-800
        rounded-xl border border-slate-200 dark:border-slate-700
        p-4 hover:shadow-md transition-all duration-200 cursor-pointer
        hover:border-blue-300 dark:hover:border-blue-600
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
                            {currentAlert.affects_me && !alert.resolved && (
                                <span className="flex-shrink-0 badge bg-blue-100 text-blue-700
                                   dark:bg-blue-900 dark:text-blue-300">
                                    Affects me
                                </span>
                            )}
                            {alert.verification_status && alert.verification_status !== 'pending' && (
                                <span className={`flex-shrink-0 badge ${
                                    alert.verification_status === 'verified' 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                        : alert.verification_status === 'fake'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                                }`}>
                                    {alert.verification_status === 'verified' ? '✓ ' : 
                                     alert.verification_status === 'fake' ? '✗ ' : '⚠ '}
                                    {alert.verification_status}
                                    {alert.verification_breakdown && Object.keys(alert.verification_breakdown).length > 0 && (
                                        <span className="ml-1 text-xs">
                                            ({Object.entries(alert.verification_breakdown).map(([type, count]) => {
                                                const icon = type === 'verified' ? '✓' : type === 'fake' ? '✗' : '⚠'
                                                return `${icon}${count}`
                                            }).join(', ')})
                                        </span>
                                    )}
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
                    <LocationBadge alert={alert} />
                    
                    {/* Affects Me Button */}
                    <button
                        onClick={handleAffectsMeToggle}
                        className={`px-2 py-1 text-xs rounded-lg border font-medium transition-colors ${
                            localAffectsMe
                                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300'
                                : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        {localAffectsMe ? '✓ Affects me' : '+ This affects me'}
                    </button>
                    
                    <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(alert.date)}
                    </span>
                </div>
            </article>
        </Link>
    )
}