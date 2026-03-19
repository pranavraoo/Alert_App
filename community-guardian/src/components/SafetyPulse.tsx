'use client'

import { useStore } from '@/store/useStore'

export default function SafetyPulse() {
    const alerts = useStore((s) => s.alerts)
    const loading = useStore((s) => s.loading)

    if (loading) {
        return <div className="skeleton h-16 w-full rounded-xl" />
    }

    const active = alerts.filter((a) => !a.resolved)
    const affectsMe = active.filter((a) => a.affects_me)
    const activeCount = active.length
    const affectsMeCount = affectsMe.length

    if (activeCount === 0) {
        return (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl
                      bg-green-50 border border-green-200
                      dark:bg-green-900/30 dark:border-green-800">
                <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                        You're caught up
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                        No active alerts right now
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl
                    bg-amber-50 border border-amber-200
                    dark:bg-amber-900/30 dark:border-amber-800">
            <span className="text-amber-600 dark:text-amber-400 text-lg">◉</span>
            <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {activeCount} {activeCount === 1 ? 'thing needs' : 'things need'} your attention
                </p>
                {affectsMeCount > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        {affectsMeCount} directly {affectsMeCount === 1 ? 'affects' : 'affect'} you
                    </p>
                )}
            </div>
        </div>
    )
}