'use client'

import { useMemo, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts'
import type { Alert } from '@/types/alert'

interface Props {
    alerts: Alert[]
}

const SEVERITY_COLORS = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
}

function getLast14Days(): string[] {
    return Array.from({ length: 14 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (13 - i))
        return d.toISOString().split('T')[0]
    })
}

export default function TrendChart({ alerts }: Props) {
    const [open, setOpen] = useState(false)

    const data = useMemo(() => {
        const days = getLast14Days()
        return days.map((day) => {
            const dayAlerts = alerts.filter((a) => a.date.startsWith(day))
            return {
                date: day.slice(5),   // MM-DD
                low: dayAlerts.filter((a) => a.severity === 'low').length,
                medium: dayAlerts.filter((a) => a.severity === 'medium').length,
                high: dayAlerts.filter((a) => a.severity === 'high').length,
                critical: dayAlerts.filter((a) => a.severity === 'critical').length,
            }
        })
    }, [alerts])

    const hasData = data.some(
        (d) => d.low + d.medium + d.high + d.critical > 0
    )

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
                <span>📈 Severity Trend — Last 14 Days</span>
                <span className="text-slate-400">{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div className="px-4 pb-4">
                    {!hasData ? (
                        <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">
                            No alert data for the past 14 days
                        </p>
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