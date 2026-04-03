'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { apiClient } from '@/lib/api-client'
import type { Alert } from '@/types/alert'
import ThreatDNA from './ThreatDNA'
import LocationBadge from './LocationBadge'
import {
    SEVERITY_STYLES,
    SOURCE_STYLES,
    CATEGORY_STYLES,
} from '@/lib/constants'

interface Props {
    alert: Alert
}

const SEVERITY_BORDER: Record<string, string> = {
    critical: 'border-l-red-500',
    high:     'border-l-orange-400',
    medium:   'border-l-amber-400',
    low:      'border-l-emerald-400',
}

const SEVERITY_BG: Record<string, string> = {
    critical: 'from-red-500/[0.08]    via-red-500/[0.02]    to-transparent',
    high:     'from-orange-400/[0.08] via-orange-400/[0.02] to-transparent',
    medium:   'from-amber-400/[0.06]  via-amber-400/[0.01]  to-transparent',
    low:      'from-emerald-400/[0.08] via-teal-400/[0.03]   to-transparent',
}

const SEVERITY_GLOW: Record<string, string> = {
    critical: 'hover:shadow-red-200/40    dark:hover:shadow-red-900/30',
    high:     'hover:shadow-orange-200/40 dark:hover:shadow-orange-900/30',
    medium:   'hover:shadow-amber-200/40  dark:hover:shadow-amber-900/30',
    low:      'hover:shadow-emerald-200/40 dark:hover:shadow-emerald-900/30',
}

const SEVERITY_DOT: Record<string, string> = {
    critical: 'bg-red-500',
    high:     'bg-orange-400',
    medium:   'bg-amber-400',
    low:      'bg-emerald-400',
}

function formatDate(dateStr: string): string {
    try {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        if (diffHours < 1) return 'Just now'
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
        return dateStr
    }
}

export default function AlertCard({ alert }: Props) {
    const updateAlert = useStore((s) => s.updateAlert)
    const alerts = useStore((s) => s.alerts)

    const currentAlert = alerts.find(a => a.id === alert.id) || alert
    const [localAffectsMe, setLocalAffectsMe] = useState(currentAlert.affects_me || false)

    const handleAffectsMeToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const newVal = !localAffectsMe
        setLocalAffectsMe(newVal)
        updateAlert(alert.id, { affects_me: newVal })
        try {
            await apiClient.updateAlert(alert.id, { affects_me: newVal })
        } catch {
            setLocalAffectsMe(!newVal)
            updateAlert(alert.id, { affects_me: !newVal })
        }
    }

    const latestAlert = alerts.find(a => a.id === alert.id)
    useEffect(() => {
        if (latestAlert && latestAlert.affects_me !== localAffectsMe) {
            setLocalAffectsMe(latestAlert.affects_me || false)
        }
    }, [latestAlert, localAffectsMe])

    const borderColor = SEVERITY_BORDER[alert.severity] ?? SEVERITY_BORDER.low
    const glowColor   = SEVERITY_GLOW[alert.severity]   ?? SEVERITY_GLOW.low
    const dotColor    = SEVERITY_DOT[alert.severity]    ?? SEVERITY_DOT.low

    return (
        <Link href={`/alerts/${alert.id}`}>
            <article
                aria-label={`${alert.title}, ${alert.category}, ${alert.severity} severity`}
                className={`
                    group relative
                    bg-white dark:bg-slate-800/60
                    rounded-2xl
                    border border-slate-200/80 dark:border-slate-700/50
                    border-l-[3px] ${borderColor}
                    px-5 py-4
                    hover:shadow-lg ${glowColor}
                    hover:border-slate-300/80 dark:hover:border-slate-600/60
                    transition-all duration-300 ease-out
                    cursor-pointer
                    ${alert.resolved ? 'opacity-50' : ''}
                `}
            >
                {/* Severity gradient wash */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${SEVERITY_BG[alert.severity] ?? SEVERITY_BG.low} pointer-events-none`} />
                {/* ── Content above gradient ─────────────────────────────── */}
                <div className="relative z-10">
                {/* ── Row 1: Category · Severity · Date ─────────────────── */}
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-3">
                        {/* Category chip — distinctive color coding */}
                        <span className={`
                            text-[10px] sm:text-[11px] font-bold uppercase tracking-wider
                            px-2 py-0.5 rounded-md border
                            ${(() => {
                                const style = CATEGORY_STYLES[alert.category as keyof typeof CATEGORY_STYLES]
                                if (style) return style + ' border-current/20'
                                
                                // Fallback for dynamic categories (hash-based color)
                                const hash = alert.category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                                const colors = [
                                    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
                                    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
                                    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800',
                                    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
                                    'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800',
                                    'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800',
                                ]
                                return colors[hash % colors.length]
                            })()}
                        `}>
                            {alert.category}
                        </span>

                        <span className="text-slate-200 dark:text-slate-700">|</span>

                        {/* Severity dot + label */}
                        <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                            <span className="text-[11px] font-medium capitalize
                                             text-slate-400 dark:text-slate-500">
                                {alert.severity}
                            </span>
                        </span>

                        {/* Affects me pill */}
                        {currentAlert.affects_me && !alert.resolved && (
                            <>
                                <span className="text-slate-200 dark:text-slate-700">|</span>
                                <span className="text-[11px] font-semibold text-blue-500 dark:text-blue-400">
                                    ⚡ Affects you
                                </span>
                            </>
                        )}
                    </div>

                    <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                        {formatDate(alert.date)}
                    </span>
                </div>

                {/* ── Row 2: Title ──────────────────────────────────────── */}
                <h2 className="text-base font-semibold leading-snug
                               text-slate-800 dark:text-slate-100
                               line-clamp-2
                               group-hover:text-blue-600 dark:group-hover:text-blue-400
                               transition-colors duration-200">
                    {alert.title}
                </h2>

                {/* ── Row 3: Summary ────────────────────────────────────── */}
                <p className="mt-2 text-sm leading-relaxed
                              text-slate-500 dark:text-slate-400
                              line-clamp-2">
                    {alert.summary || alert.description}
                </p>

                {/* ── Row 4: Footer ─────────────────────────────────────── */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60
                                flex items-center justify-between gap-4">

                    {/* Left: source · location · verification */}
                    <div className="flex items-center gap-3 flex-wrap text-[12px]
                                    text-slate-400 dark:text-slate-500 min-w-0">
                        <span className="font-medium text-slate-500 dark:text-slate-400">
                            {alert.source}
                        </span>

                        {alert.location && (
                            <>
                                <span className="text-slate-300 dark:text-slate-600">·</span>
                                <span>📍 {alert.location}</span>
                            </>
                        )}

                        <LocationBadge alert={alert} />

                        {alert.resolved && (
                            <>
                                <span className="text-slate-300 dark:text-slate-600">·</span>
                                <span className="text-slate-400">Resolved</span>
                            </>
                        )}

                        {alert.verification_status && alert.verification_status !== 'pending' && (
                            <>
                                <span className="text-slate-300 dark:text-slate-600">·</span>
                                <span className={
                                    alert.verification_status === 'verified'
                                        ? 'text-emerald-500 dark:text-emerald-400 font-medium'
                                        : alert.verification_status === 'fake'
                                        ? 'text-red-500 dark:text-red-400 font-medium'
                                        : 'text-amber-500 dark:text-amber-400 font-medium'
                                }>
                                    {alert.verification_status === 'verified' ? '✓ Verified'
                                     : alert.verification_status === 'fake'   ? '✗ Fake'
                                     : '⚠ Disputed'}
                                    {alert.verification_breakdown
                                        && Object.keys(alert.verification_breakdown).length > 0 && (
                                        <span className="opacity-60 font-normal ml-1">
                                            ({Object.entries(alert.verification_breakdown)
                                                .map(([t, c]) =>
                                                    `${t === 'verified' ? '✓' : t === 'fake' ? '✗' : '⚠'}${c}`)
                                                .join(', ')})
                                        </span>
                                    )}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Right: affects me toggle */}
                    <button
                        onClick={handleAffectsMeToggle}
                        className={`flex-shrink-0 text-[12px] font-medium
                                    transition-colors duration-200 whitespace-nowrap
                                    ${localAffectsMe
                                        ? 'text-blue-500 dark:text-blue-400 hover:text-blue-600'
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                    >
                        {localAffectsMe ? '✓ Affects me' : '+ Affects me'}
                    </button>
                </div>
                </div>
            </article>
        </Link>
    )
}