'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { usePreferences } from '@/hooks/usePreferences'
import { useGuardians } from '@/hooks/useGuardians'
import MyConcerns from '@/components/MyConcerns'
import MySeverities from '@/components/MySeverities'
import GuardianCircle from '@/components/GuardianCircle'
import { useTheme } from '@/hooks/useTheme'

export default function SettingsPage() {
    const { updatePreferences } = usePreferences()
    const { fetchGuardians } = useGuardians()
    const { theme, setTheme } = useTheme()

    const store = useStore()
    const preferences = store.preferences
    const [savingPrefs, setSavingPrefs] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        // Only fetch guardians, preferences are loaded by PreferencesLoader
        fetchGuardians()
    }, []) // eslint-disable-line

    const handleConcernsChange = async (concerns: string[]) => {
        setSavingPrefs(true)
        await updatePreferences({ concerns })
        setSavingPrefs(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const handleSeveritiesChange = async (severities: string[]) => {
        setSavingPrefs(true)
        await updatePreferences({ severities })
        setSavingPrefs(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Settings
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Personalise your Community Guardian experience.
                </p>
            </div>

            {/* My Concerns */}
            <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <MyConcerns
                    selected={preferences?.concerns ?? []}
                    onChange={handleConcernsChange}
                    saving={savingPrefs}
                />
            </div>

            {/* My Severities */}
            <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <MySeverities
                    selected={preferences?.severities ?? []}
                    onChange={handleSeveritiesChange}
                    saving={savingPrefs}
                />
                {saved && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ Preferences saved
                    </p>
                )}
            </div>

            {/* Theme */}
            <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-6 space-y-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Appearance
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Choose your preferred colour scheme.
                    </p>
                </div>
                <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`flex-1 py-2 text-sm rounded-lg border-2 font-medium
                          capitalize transition-colors
                          ${theme === t
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                    : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                                }`}
                        >
                            {t === 'light' ? '☀️ Light' : t === 'dark' ? '🌙 Dark' : '💻 System'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Guardian Circle */}
            <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-6">
                <GuardianCircle />
            </div>

            {/* About */}
            <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-6 space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    About
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Community Guardian aggregates real threat intelligence from CISA,
                    NVD, and OpenPhish — filtered by AI to give you calm, actionable
                    safety digests.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    Data sources: CISA KEV · NVD CVE · OpenPhish
                </p>
            </div>

        </div>
    )
}