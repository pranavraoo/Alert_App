'use client'

import { useEffect, useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { useAlerts } from '@/hooks/useAlerts'
import { usePreferences } from '@/hooks/usePreferences'
import AlertCard from '@/components/AlertCard'
import SafetyPulse from '@/components/SafetyPulse'
import SmartMyConcerns from '@/components/SmartMyConcerns'
import FocusMode from '@/components/FocusMode'
import SkeletonList from '@/components/SkeletonList'
import CommonPagination from '@/components/CommonPagination'
import { filterAlertsByConcerns } from '@/lib/categoryMatcher'
import type { Alert } from '@/types/alert'

type DigestTab = 'for-you' | 'all-critical'

export default function DigestPage() {
    const { fetchAlerts } = useAlerts()
    const { updatePreferences } = usePreferences()

    const alerts = useStore((s) => s.alerts)
    const preferences = useStore((s) => s.preferences)
    const loading = useStore((s) => s.loading)

    // Local state for categories to decouple from global preferences
    const [activeViewConcerns, setActiveViewConcerns] = useState<string[]>([])
    const [tab, setTab] = useState<DigestTab>('for-you')
    const [focusMode, setFocusMode] = useState(false)
    const [savingPrefs, setSavingPrefs] = useState(false)
    const [copied, setCopied] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const PAGE_SIZE = 10

    // Load everything on mount and initialize local concerns from preferences
    useEffect(() => {
        const init = async () => {
            if (preferences?.concerns) {
                setActiveViewConcerns(preferences.concerns)
            }
            // Broad fetch for Digest: all active alerts, limit 100 to ensure we see all criticals
            await fetchAlerts({ status: 'unresolved', limit: 100 } as any)
        }
        init()
    }, [preferences?.concerns]) // eslint-disable-line

    // Reset pagination when tab or concerns change
    useEffect(() => {
        setCurrentPage(1)
    }, [tab, activeViewConcerns])

    // Active alerts only
    const activeAlerts = alerts.filter((a) => !a.resolved)

    // "For you" — filtered by concerns using smart matching, then critical severity only
    const concerns = activeViewConcerns
    const concernFilteredAlerts: Alert[] = concerns.length > 0 
        ? filterAlertsByConcerns(activeAlerts, concerns)
        : []
    const forYouAlerts: Alert[] = concernFilteredAlerts.filter((a) => a.severity === 'critical')

    // "All Critical" — all critical alerts in the system, regardless of category
    const allCriticalAlerts = activeAlerts.filter((a) => a.severity === 'critical')

    // "Directly affects me" — any critical alert marked as personal
    const affectsMeAlerts = activeAlerts.filter((a) => a.affects_me && a.severity === 'critical')

    // "For you" alerts minus the ones already in affectsMe to avoid duplicates
    const affectsMeIds = new Set(affectsMeAlerts.map((a) => a.id))
    const otherAlerts = forYouAlerts.filter((a) => !affectsMeIds.has(a.id))

    // "All critical" tab shows everyone, with affects_me first
    const allCriticalOther = allCriticalAlerts.filter((a) => !affectsMeIds.has(a.id))

    const displayAlerts = tab === 'for-you' ? [...affectsMeAlerts, ...otherAlerts] : [...affectsMeAlerts, ...allCriticalOther]

    // Pagination logic
    const totalItems = displayAlerts.length
    const totalPages = Math.ceil(totalItems / PAGE_SIZE)
    const paginatedAlerts = displayAlerts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    const handleConcernsChange = async (concerns: string[]) => {
        // Only update local view state, do NOT update global preferences
        setActiveViewConcerns(concerns)
    }

    const handleShareDigest = () => {
        const url = `${window.location.origin}/shared/digest/default`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Focus mode
    if (focusMode) {
        return (
            <FocusMode
                alerts={displayAlerts}
                onClose={() => setFocusMode(false)}
            />
        )
    }

    return (
        <div className="space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Digest
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFocusMode(true)}
                        disabled={displayAlerts.length === 0}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg
                       border border-slate-200 dark:border-slate-600
                       text-slate-600 dark:text-slate-400
                       hover:bg-slate-50 dark:hover:bg-slate-700
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors"
                    >
                        🎯 Focus mode
                    </button>
                    <button
                        onClick={handleShareDigest}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg
                       border border-slate-200 dark:border-slate-600
                       text-slate-600 dark:text-slate-400
                       hover:bg-slate-50 dark:hover:bg-slate-700
                       transition-colors"
                    >
                        {copied ? '✓ Copied!' : '🔗 Share digest'}
                    </button>
                </div>
            </div>

            {/* Safety Pulse */}
            <SafetyPulse />

            {/* My Concerns */}
            <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-4">
                <SmartMyConcerns
                    selected={concerns}
                    onChange={handleConcernsChange}
                    saving={savingPrefs}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800
                      rounded-lg w-fit">
                {([
                    { id: 'for-you', label: `For you (${affectsMeAlerts.length + otherAlerts.length})` },
                    { id: 'all-critical', label: `All critical (${affectsMeAlerts.length + allCriticalOther.length})` },
                ] as { id: DigestTab; label: string }[]).map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors
              ${tab === t.id
                                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Affects me section — pinned top */}
            {tab === 'for-you' && affectsMeAlerts.length > 0 && (
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400
                         uppercase tracking-wide">
                        ⚡ Directly affects you
                    </p>
                    {affectsMeAlerts.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                    ))}
                    {otherAlerts.length > 0 && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400
                           uppercase tracking-wide pt-2">
                            Other alerts
                        </p>
                    )}
                </div>
            )}

            {/* Alert list */}
            {loading ? (
                <SkeletonList count={4} />
            ) : displayAlerts.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                    <p className="text-4xl">
                        {concerns.length > 0 ? '🎯' : '✓'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        {concerns.length > 0
                            ? 'No active alerts for your selected concerns'
                            : 'No active alerts right now'
                        }
                    </p>
                    {concerns.length > 0 && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Try selecting more categories above or check "All active"
                        </p>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {paginatedAlerts.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                    ))}
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pt-4">
                            <CommonPagination
                                page={currentPage}
                                pages={totalPages}
                                hasNext={currentPage < totalPages}
                                hasPrev={currentPage > 1}
                                onPageChange={setCurrentPage}
                                total={totalItems}
                                limit={PAGE_SIZE}
                            />
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}