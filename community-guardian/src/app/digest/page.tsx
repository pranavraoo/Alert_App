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
import { filterAlertsByConcerns } from '@/lib/categoryMatcher'
import type { Alert } from '@/types/alert'

type DigestTab = 'for-you' | 'all-active'

export default function DigestPage() {
    const { fetchAlerts } = useAlerts()
    const { fetchPreferences, updatePreferences } = usePreferences()

    const alerts = useStore((s) => s.alerts)
    const preferences = useStore((s) => s.preferences)
    const loading = useStore((s) => s.loading)

    const [tab, setTab] = useState<DigestTab>('for-you')
    const [focusMode, setFocusMode] = useState(false)
    const [savingPrefs, setSavingPrefs] = useState(false)
    const [copied, setCopied] = useState(false)

    // Load everything on mount
    useEffect(() => {
        const init = async () => {
            await Promise.all([
                fetchAlerts({ status: 'active' }),
                fetchPreferences(),
            ])
        }
        init()
    }, []) // eslint-disable-line

    // Active alerts only
    const activeAlerts = alerts.filter((a) => !a.resolved)

    // "For you" — filtered by concerns using smart matching, then critical severity only
    const concerns = preferences?.concerns ?? []
    const concernFilteredAlerts: Alert[] = filterAlertsByConcerns(activeAlerts, concerns)
    const forYouAlerts: Alert[] = concernFilteredAlerts.filter((a) => a.severity === 'critical')

    // "Directly affects me" — pinned at top
    const affectsMeAlerts = forYouAlerts.filter((a) => a.affects_me)
    const otherAlerts = forYouAlerts.filter((a) => !a.affects_me)

    const displayAlerts = tab === 'for-you' ? forYouAlerts : activeAlerts

    const handleConcernsChange = async (concerns: string[]) => {
        setSavingPrefs(true)
        await updatePreferences({ concerns })
        setSavingPrefs(false)
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
                    { id: 'for-you', label: `For you (${forYouAlerts.length})` },
                    { id: 'all-active', label: `All active (${activeAlerts.length})` },
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
                <div className="space-y-2">
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
                <div className="space-y-3">
                    {(tab === 'for-you' ? otherAlerts : displayAlerts).map((alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                    ))}
                </div>
            )}

        </div>
    )
}