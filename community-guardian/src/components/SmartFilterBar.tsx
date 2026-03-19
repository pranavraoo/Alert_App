'use client'

import { useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import {
    SEVERITIES,
    SOURCES,
    LOCATIONS,
} from '@/lib/constants'
import { getUniqueDynamicCategories, filterAlertsByConcerns } from '@/lib/categoryMatcher'

export interface Filters {
    search: string
    category: string
    severity: string
    status: string
    source: string
    location: string
    affects_me: boolean
}

export const DEFAULT_FILTERS: Filters = {
    search: '',
    category: '',
    severity: '',
    status: '',
    source: '',
    location: '',
    affects_me: false,
}

interface Props {
    filters: Filters
    onChange: (filters: Filters) => void
    total: number
}

export default function SmartFilterBar({ filters, onChange, total }: Props) {
    const [showFilters, setShowFilters] = useState(false)
    const alerts = useStore((s) => s.alerts)
    
    // Get dynamic categories from current alerts
    const dynamicCategories = getUniqueDynamicCategories(alerts)
    const allCategories = [...new Set([...dynamicCategories, ...['Scam', 'Phishing', 'Imposter', 'Data breach', 'Local safety', 'CVE', 'Other']])]

    const update = useCallback(
        (key: keyof Filters, value: string | boolean) => {
            onChange({ ...filters, [key]: value })
        },
        [filters, onChange]
    )

    const isFiltered =
        filters.search !== '' ||
        filters.category !== '' ||
        filters.severity !== '' ||
        filters.status !== '' ||
        filters.source !== '' ||
        filters.location !== '' ||
        filters.affects_me

    const activeCount = [
        filters.category,
        filters.severity,
        filters.status,
        filters.source,
        filters.location,
        filters.affects_me ? 'x' : '',
    ].filter(Boolean).length

    // Calculate filtered count for preview
    const filteredAlerts = alerts.filter(alert => {
        if (filters.search && !alert.title.toLowerCase().includes(filters.search.toLowerCase()) && 
            !alert.description.toLowerCase().includes(filters.search.toLowerCase())) {
            return false
        }
        if (filters.category && alert.category !== filters.category) {
            return false
        }
        if (filters.severity && alert.severity !== filters.severity) {
            return false
        }
        if (filters.status === 'resolved' && !alert.resolved) return false
        if (filters.status === 'unresolved' && alert.resolved) return false
        if (filters.source && alert.source !== filters.source) return false
        if (filters.location && !alert.location?.toLowerCase().includes(filters.location.toLowerCase())) {
            return false
        }
        if (filters.affects_me && !alert.affects_me) return false
        return true
    })

    return (
        <div className="space-y-3">
            {/* Search + filter toggle row */}
            <div className="flex gap-2">
                {/* Search */}
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2
                           text-slate-400 text-sm pointer-events-none">
                        🔍
                    </span>
                    <input
                        type="search"
                        value={filters.search}
                        onChange={(e) => update('search', e.target.value)}
                        placeholder="Search alerts..."
                        aria-label="Search alerts"
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg
                       border border-slate-200 dark:border-slate-600
                       bg-white dark:bg-slate-800
                       text-slate-800 dark:text-slate-100
                       placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filter toggle */}
                <button
                    onClick={() => setShowFilters((v) => !v)}
                    aria-expanded={showFilters}
                    aria-controls="filter-panel"
                    className={`
            flex items-center gap-2 px-3 py-2 text-sm rounded-lg
            border transition-colors
            ${showFilters
                            ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'
                        }
          `}
                >
                    <span>Filters</span>
                    {activeCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full
                             w-4 h-4 flex items-center justify-center font-bold">
                            {activeCount}
                        </span>
                    )}
                </button>

                {/* Clear all */}
                {isFiltered && (
                    <button
                        onClick={() => onChange(DEFAULT_FILTERS)}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-200
                       text-slate-500 hover:text-slate-700 hover:bg-slate-50
                       dark:border-slate-600 dark:text-slate-400
                       dark:hover:bg-slate-700 transition-colors"
                    >
                        Clear
                    </button>
                )}

                {/* Results count */}
                <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                    {filteredAlerts.length} of {total} results
                </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
                <div
                    id="filter-panel"
                    className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3
                     bg-white dark:bg-slate-800 rounded-xl
                     border border-slate-200 dark:border-slate-700"
                >
                    {/* Category */}
                    <select
                        value={filters.category}
                        onChange={(e) => update('category', e.target.value)}
                        aria-label="Filter by category"
                        className="select-input"
                    >
                        <option value="">All categories</option>
                        <optgroup label="Dynamic Categories">
                            {dynamicCategories.map((c) => (
                                <option key={c} value={c}>{c} 🆕</option>
                            ))}
                        </optgroup>
                        <optgroup label="Base Categories">
                            {['Scam', 'Phishing', 'Imposter', 'Data breach', 'Local safety', 'CVE', 'Other']
                                .filter(c => !dynamicCategories.includes(c))
                                .map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                        </optgroup>
                    </select>

                    {/* Severity */}
                    <select
                        value={filters.severity}
                        onChange={(e) => update('severity', e.target.value)}
                        aria-label="Filter by severity"
                        className="select-input"
                    >
                        <option value="">All severities</option>
                        {SEVERITIES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {/* Status */}
                    <select
                        value={filters.status}
                        onChange={(e) => update('status', e.target.value)}
                        aria-label="Filter by status"
                        className="select-input"
                    >
                        <option value="">All alerts</option>
                        <option value="unresolved">Unresolved</option>
                        <option value="resolved">Resolved</option>
                    </select>

                    {/* Source */}
                    <select
                        value={filters.source}
                        onChange={(e) => update('source', e.target.value)}
                        aria-label="Filter by source"
                        className="select-input"
                    >
                        <option value="">All sources</option>
                        {SOURCES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {/* Location */}
                    <input
                        type="text"
                        value={filters.location}
                        onChange={(e) => update('location', e.target.value)}
                        placeholder="Location..."
                        aria-label="Filter by location"
                        className="select-input"
                    />

                    {/* Affects me */}
                    <label className="flex items-center gap-2 p-2 text-sm cursor-pointer
                     hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <input
                            type="checkbox"
                            checked={filters.affects_me}
                            onChange={(e) => update('affects_me', e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 
                             focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                            ⚡ Affects me
                        </span>
                    </label>
                </div>
            )}
        </div>
    )
}
