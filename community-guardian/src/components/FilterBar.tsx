'use client'

import { useState, useCallback } from 'react'
import {
    CATEGORIES,
    SEVERITIES,
    SOURCES,
    LOCATIONS,
} from '@/lib/constants'

export interface Filters {
    search: string
    category: string
    severity: string
    status: string
    source: string
    location: string
    affects_me: boolean
    verification_status: string
}

export const DEFAULT_FILTERS: Filters = {
    search: '',
    category: '',
    severity: '',
    status: '',
    source: '',
    location: '',
    affects_me: false,
    verification_status: '',
}

interface Props {
    filters: Filters
    onChange: (filters: Filters) => void
    total: number
}

export default function FilterBar({ filters, onChange, total }: Props) {
    const [showFilters, setShowFilters] = useState(false)

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
        filters.affects_me ||
        filters.verification_status !== ''

    const activeCount = [
        filters.category,
        filters.severity,
        filters.status,
        filters.source,
        filters.location,
        filters.affects_me ? 'x' : '',
        filters.verification_status,
    ].filter(Boolean).length

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
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
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
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
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
                    <select
                        value={filters.location}
                        onChange={(e) => update('location', e.target.value)}
                        aria-label="Filter by location"
                        className="select-input"
                    >
                        <option value="">All locations</option>
                        {LOCATIONS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>

                    {/* Affects me toggle */}
                    <label className="flex items-center gap-2 px-3 py-2 cursor-pointer
                            rounded-lg border border-slate-200 dark:border-slate-600
                            hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <input
                            type="checkbox"
                            checked={filters.affects_me}
                            onChange={(e) => update('affects_me', e.target.checked)}
                            className="rounded border-slate-300 text-blue-600
                         focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                            Affects me
                        </span>
                    </label>

                    {/* Verification Status */}
                    <select
                        value={filters.verification_status}
                        onChange={(e) => update('verification_status', e.target.value)}
                        aria-label="Filter by verification status"
                        className="select-input"
                    >
                        <option value="">All verification</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="fake">Fake</option>
                        <option value="disputed">Disputed</option>
                    </select>
                </div>
            )}
        </div>
    )
}