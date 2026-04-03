'use client'

import { useState, useEffect } from 'react'
import { CATEGORY_STYLES } from '@/lib/constants'
import { useStore } from '@/store/useStore'
import { getUniqueDynamicCategories } from '@/lib/categoryMatcher'

interface Props {
    selected: string[]
    onChange: (concerns: string[]) => void
    saving?: boolean
}

export default function SmartMyConcerns({ selected, onChange, saving }: Props) {
    const alerts = useStore((s) => s.alerts)
    const [allKnownCategories, setAllKnownCategories] = useState<string[]>([])

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

    return (
        <div className="space-y-4">
            <div className="pb-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>What matters to you?</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[10px] text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800">
                        Smart Feed
                    </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-lg">
                    Select the categories you care about most. Your personal digest will prioritize these topics, 
                    ensuring you never miss critical updates in your areas of interest.
                </p>
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
