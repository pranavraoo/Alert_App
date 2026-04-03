'use client'

import { useMemo, useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts'
import type { Alert } from '@/types/alert'
import type { Filters } from '@/components/SmartFilterBar'

interface Props {
    filters: Filters
}

const SEVERITY_COLORS = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
}

type DateRange = '7d' | '14d' | '30d' | 'custom'

function getDateRange(range: DateRange, customStart?: string, customEnd?: string): string[] {
    if (range === 'custom') {
        if (!customStart || !customEnd) return []
        const start = new Date(customStart)
        const end = new Date(customEnd)
        const days: string[] = []
        for (let d = new Date(start); d <= end;) {
            days.push(d.toISOString().split('T')[0])
            d = new Date(d)
            d.setUTCDate(d.getUTCDate() + 1)
        }
        return days
    }

    const days = range === '7d' ? 7 : range === '14d' ? 14 : 30
    // Use the current UTC date as a fixed baseline to generate strings
    // matching how alerts are stored in the database (YYYY-MM-DD UTC)
    const todayStr = new Date().toISOString().split('T')[0]
    const base = new Date(`${todayStr}T00:00:00Z`)
    
    return Array.from({ length: days }, (_, i) => {
        const d = new Date(base)
        d.setUTCDate(d.getUTCDate() - (days - 1 - i))
        return d.toISOString().split('T')[0]
    })
}

function getRangeLabel(range: DateRange): string {
    switch (range) {
        case '7d': return 'Last 7 Days'
        case '14d': return 'Last 14 Days'
        case '30d': return 'Last 30 Days'
        case 'custom': return 'Custom Range'
    }
}

function getInsights(data: any[]): { trend: string, recommendation: string, criticalPercent: number, highCriticalPercent: number } | null {
    const total = data.reduce((sum, d) => sum + d.low + d.medium + d.high + d.critical, 0)
    const critical = data.reduce((sum, d) => sum + d.critical, 0)
    const high = data.reduce((sum, d) => sum + d.high, 0)
    
    if (total === 0) return null
    
    const criticalPercent = (critical / total) * 100
    const highCriticalPercent = ((critical + high) / total) * 100
    
    let trend = 'stable'
    let recommendation = 'Continue monitoring alert patterns'
    
    if (criticalPercent > 20) {
        trend = 'concerning'
        recommendation = 'High number of critical alerts - review security posture immediately'
    } else if (highCriticalPercent > 40) {
        trend = 'elevated'
        recommendation = 'Elevated threat level - consider additional security measures'
    } else if (criticalPercent < 5 && highCriticalPercent < 15) {
        trend = 'low'
        recommendation = 'Threat level is low - maintain current security practices'
    }
    
    return { trend, recommendation, criticalPercent, highCriticalPercent }
}

export default function TrendChart({ filters }: Props) {
    const [chartAlerts, setChartAlerts] = useState<Alert[]>([])
    const [open, setOpen] = useState(false)
    const [dateRange, setDateRange] = useState<DateRange>('14d')
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')

    useEffect(() => {
        // ALWAYS fetch from page 1 for the chart to ensure we get historical data
        // Explicitly ignore 'search', 'status', and 'page' filters for the trend chart
        // This makes the chart a stable baseline of overall community activity
        const { search, status, page, ...stableFilters } = filters;
        apiClient.getAlerts({ ...stableFilters, page: 1, limit: 1000 })
            .then(res => {
                if (res?.data?.data) {
                    setChartAlerts(res.data.data)
                }
            })
            .catch(err => console.error("Could not load trend data", err))
    }, [filters])

    // Calculate earliest and latest dates available in the filtered dataset
    const availableDateRange = useMemo(() => {
        if (chartAlerts.length === 0) return null
        
        const dates = chartAlerts
            .map(a => a.created_at ? a.created_at.split('T')[0] : a.date)
            .filter(Boolean)
            .sort()
            
        return {
            earliest: dates[0],
            latest: dates[dates.length - 1],
            count: dates.length
        }
    }, [chartAlerts])

    const data = useMemo(() => {
        const days = getDateRange(dateRange, customStart, customEnd)
        
        return days.map((day) => {
            // Unify date extraction - handle Date objects, strings, and nulls
            const dayAlerts = chartAlerts.filter((a) => {
                const rawDate = a.created_at || a.date
                if (!rawDate) return false
                const alertDate = (typeof rawDate === 'string' ? rawDate : (rawDate as any).toISOString()).split('T')[0]
                return alertDate === day
            })
            return {
                date: day.slice(5),   // MM-DD
                fullDate: day,
                // Use lowercase comparison to handle potential case mismatches
                low: dayAlerts.filter((a) => a.severity?.toLowerCase() === 'low').length,
                medium: dayAlerts.filter((a) => a.severity?.toLowerCase() === 'medium').length,
                high: dayAlerts.filter((a) => a.severity?.toLowerCase() === 'high').length,
                critical: dayAlerts.filter((a) => a.severity?.toLowerCase() === 'critical').length,
            }
        })
    }, [chartAlerts, dateRange, customStart, customEnd])

    const hasData = chartAlerts.length > 0

    const insights = useMemo(() => getInsights(data), [data])

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl
                    border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3
                   text-sm font-medium text-slate-700 dark:text-slate-300
                   hover:bg-slate-50 dark:hover:bg-slate-700/50
                   rounded-xl transition-colors"
                aria-expanded={open}
            >
                <span>📈 Severity Trend — {getRangeLabel(dateRange)}</span>
                <span className="text-slate-400">{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Date Range Selector */}
                    <div className="flex flex-wrap gap-2">
                        {(['7d', '14d', '30d'] as DateRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                                    dateRange === range
                                        ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300'
                                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {range === '7d' ? '7D' : range === '14d' ? '14D' : '30D'}
                            </button>
                        ))}
                        <button
                            onClick={() => setDateRange('custom')}
                            className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                                dateRange === 'custom'
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300'
                                    : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            Custom
                        </button>
                    </div>

                    {/* Custom Date Range */}
                    {dateRange === 'custom' && (
                        <div className="flex gap-2 items-center">
                            <input
                                type="date"
                                max="9999-12-31"
                                value={customStart}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // Basic character check for year segments
                                    if (val.split('-')[0]?.length <= 4) setCustomStart(val);
                                }}
                                className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                placeholder="Start date"
                            />
                            <span className="text-xs text-slate-400">to</span>
                            <input
                                type="date"
                                max="9999-12-31"
                                value={customEnd}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.split('-')[0]?.length <= 4) setCustomEnd(val);
                                }}
                                className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                placeholder="End date"
                            />
                            {(customStart || customEnd) && (
                                <button
                                    onClick={() => { setCustomStart(''); setCustomEnd('') }}
                                    className="text-xs px-2 py-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                                    aria-label="Clear dates"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                    {/* Insights */}
                    {insights && (
                        <div className={`p-3 rounded-lg border ${
                            insights.trend === 'concerning' 
                                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                : insights.trend === 'elevated'
                                ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                                : insights.trend === 'low'
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                        }`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-semibold ${
                                    insights.trend === 'concerning'
                                        ? 'text-red-700 dark:text-red-300'
                                        : insights.trend === 'elevated'
                                        ? 'text-amber-700 dark:text-amber-300'
                                        : insights.trend === 'low'
                                        ? 'text-green-700 dark:text-green-300'
                                        : 'text-blue-700 dark:text-blue-300'
                                }`}>
                                    {insights.trend === 'concerning' ? '⚠️' : insights.trend === 'elevated' ? '🔶' : insights.trend === 'low' ? '✅' : '📊'} 
                                    {' '}{insights.trend.charAt(0).toUpperCase() + insights.trend.slice(1)} threat level
                                </span>
                            </div>
                            <p className={`text-xs ${
                                insights.trend === 'concerning'
                                    ? 'text-red-600 dark:text-red-400'
                                    : insights.trend === 'elevated'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : insights.trend === 'low'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-blue-600 dark:text-blue-400'
                            }`}>
                                {insights.recommendation}
                            </p>
                        </div>
                    )}

                    {/* Chart */}
                    {!hasData ? (
                        <div className="text-center py-4 space-y-2">
                            <p className="text-sm text-slate-400 dark:text-slate-500">
                                No alert data for the selected period
                            </p>
                            {dateRange === 'custom' && availableDateRange && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                    <p>Available data: {availableDateRange.earliest} to {availableDateRange.latest}</p>
                                    <p>Try selecting dates within this range</p>
                                </div>
                            )}
                            {dateRange === 'custom' && !customStart && !customEnd && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Select start and end dates above
                                </p>
                            )}
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: '#f1f5f9',
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                                />
                                <Bar dataKey="low" stackId="a" fill={SEVERITY_COLORS.low} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="medium" stackId="a" fill={SEVERITY_COLORS.medium} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="high" stackId="a" fill={SEVERITY_COLORS.high} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="critical" stackId="a" fill={SEVERITY_COLORS.critical} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            )}
        </div>
    )
}