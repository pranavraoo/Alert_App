'use client'

import { useState, useEffect } from 'react'
import { CATEGORY_STYLES } from '@/lib/constants'
import { useStore } from '@/store/useStore'
import { getUniqueDynamicCategories, suggestConcerns, filterAlertsByConcerns } from '@/lib/categoryMatcher'
import type { Alert } from '@/types/alert'

interface Props {
    selected: string[]
    onChange: (concerns: string[]) => void
    saving?: boolean
}

export default function SmartMyConcerns({ selected, onChange, saving }: Props) {
    const alerts = useStore((s) => s.alerts)
    const [allKnownCategories, setAllKnownCategories] = useState<string[]>([])
    const [showAdvanced, setShowAdvanced] = useState(true)

    // Maintain a persistent registry of every category we encounter
    useEffect(() => {
        const uniqueDynamics = getUniqueDynamicCategories(alerts)
        
        setAllKnownCategories(prev => {
            // Combine: 
            // 1. Current selected ones (must always be visible)
            // 2. Already known ones (persistence)
            // 3. New ones from alerts (discovery)
            const combined = [...new Set([...selected, ...prev, ...uniqueDynamics])]
            return combined.sort()
        })
    }, [alerts, selected])

    const toggle = (cat: string) => {
        if (selected.includes(cat)) {
            onChange(selected.filter((c) => c !== cat))
        } else {
            onChange([...selected, cat])
        }
    }

    // Get category style (fallback for dynamic categories)
    const getCategoryStyle = (category: string) => {
        // Use predefined style if available
        if (CATEGORY_STYLES[category as keyof typeof CATEGORY_STYLES]) {
            return CATEGORY_STYLES[category as keyof typeof CATEGORY_STYLES]
        }
        
        // Generate style for dynamic categories
        const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const colors = [
            'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300',
            'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300',
            'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300',
            'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300',
            'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300',
            'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300',
        ]
        return colors[hash % colors.length]
    }

    // Preview how many alerts will be shown
    const filteredAlerts = filterAlertsByConcerns(alerts, selected)
    const totalActive = alerts.filter(a => !a.resolved).length

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    What matters to you?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Smart prioritization for dynamic categories.
                    {selected.length === 0 && ' Select categories or leave empty to see everything.'}
                </p>
            </div>

            {/* Preview */}
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                    Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredAlerts.length}</span> of {totalActive} active alerts
                </div>
            </div>

            {/* Unified Category Selection */}
            {allKnownCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 transition-all duration-300">
                    {allKnownCategories.map((cat) => {
                        const isSelected = selected.includes(cat)
                        
                        return (
                            <button
                                key={cat}
                                onClick={() => toggle(cat)}
                                disabled={saving}
                                aria-pressed={isSelected}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium
                                  border-2 transition-all relative
                                  ${isSelected
                                            ? `${getCategoryStyle(cat)} border-current scale-105 shadow-sm`
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                                        }
                                  disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {cat}
                                {isSelected && (
                                    <span className="ml-1 opacity-60">✓</span>
                                )}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
                <button
                    onClick={() => onChange(allKnownCategories)}
                    disabled={saving || allKnownCategories.length === 0}
                    className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Select all
                </button>
                
                <button
                    onClick={() => onChange([])}
                    disabled={saving}
                    className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Clear all
                </button>
            </div>
        </div>
    )
}
