'use client'

import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import type { Alert } from '@/types/alert'

export default function SafetyPulse() {
    const alerts = useStore((s) => s.alerts)
    const loading = useStore((s) => s.loading)
    const preferences = useStore((s) => s.preferences)

    const analysis = useMemo(() => {
        const active = alerts.filter((a) => !a.resolved)
        const affectsMe = active.filter((a) => a.affects_me)
        const critical = active.filter((a) => a.severity === 'critical')
        const high = active.filter((a) => a.severity === 'high')
        const nearby = active.filter((a) => a.within_radius === true)
        
        const activeCount = active.length
        const affectsMeCount = affectsMe.length
        const criticalCount = critical.length
        const highCount = high.length
        const nearbyCount = nearby.length

        // Determine safety level
        let safetyLevel: 'excellent' | 'good' | 'moderate' | 'elevated' | 'critical' = 'excellent'
        let status = 'All clear'
        let recommendation = 'Continue normal activities'
        let icon = '✓'
        let colorClass: 'green' | 'blue' | 'amber' | 'red' = 'green'

        if (criticalCount > 0) {
            safetyLevel = 'critical'
            status = `${criticalCount} critical ${criticalCount === 1 ? 'threat' : 'threats'}`
            recommendation = 'Review critical alerts immediately'
            icon = '⚠️'
            colorClass = 'red'
        } else if (highCount > 2) {
            safetyLevel = 'elevated'
            status = `${highCount} high severity alerts`
            recommendation = 'Monitor closely, consider additional precautions'
            icon = '🔶'
            colorClass = 'amber'
        } else if (activeCount > 5) {
            safetyLevel = 'moderate'
            status = `${activeCount} active alerts`
            recommendation = 'Review alerts when convenient'
            icon = '◉'
            colorClass = 'amber'
        } else if (activeCount > 0) {
            safetyLevel = 'good'
            status = `${activeCount} ${activeCount === 1 ? 'alert' : 'alerts'} to review`
            recommendation = 'Stay informed, no immediate action needed'
            icon = '○'
            colorClass = 'blue'
        }

        // Location-aware insights
        let locationInsight = ''
        if (preferences?.location_enabled && nearbyCount > 0) {
            locationInsight = `${nearbyCount} ${nearbyCount === 1 ? 'alert' : 'alerts'} near your location`
        } else if (preferences?.location_enabled) {
            locationInsight = 'No nearby threats'
        }

        return {
            safetyLevel,
            status,
            recommendation,
            icon,
            colorClass,
            activeCount,
            affectsMeCount,
            criticalCount,
            highCount,
            nearbyCount,
            locationInsight,
            hasLocationServices: preferences?.location_enabled || false
        }
    }, [alerts, preferences])

    if (loading) {
        return <div className="skeleton h-16 w-full rounded-xl" />
    }

    if (analysis.activeCount === 0) {
        return (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl
                      bg-green-50 border border-green-200
                      dark:bg-green-900/30 dark:border-green-800">
                <span className="text-green-600 dark:text-green-400 text-lg">{analysis.icon}</span>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                        You're caught up
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                        No active alerts right now
                    </p>
                </div>
                {analysis.hasLocationServices && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                        📍 Safe area
                    </span>
                )}
            </div>
        )
    }

    const colorClasses = {
        green: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
        blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
        amber: 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800',
        red: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800'
    }

    const textColors = {
        green: 'text-green-700 dark:text-green-300',
        blue: 'text-blue-700 dark:text-blue-300',
        amber: 'text-amber-700 dark:text-amber-300',
        red: 'text-red-700 dark:text-red-300'
    }

    const subTextColors = {
        green: 'text-green-600 dark:text-green-400',
        blue: 'text-blue-600 dark:text-blue-400',
        amber: 'text-amber-600 dark:text-amber-400',
        red: 'text-red-600 dark:text-red-400'
    }

    return (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${colorClasses[analysis.colorClass]}`}>
            <span className={`${subTextColors[analysis.colorClass]} text-lg`}>{analysis.icon}</span>
            <div className="flex-1">
                <p className={`text-sm font-semibold ${textColors[analysis.colorClass]}`}>
                    {analysis.status}
                </p>
                <p className={`text-xs ${subTextColors[analysis.colorClass]}`}>
                    {analysis.recommendation}
                </p>
                
                {/* Additional details */}
                <div className="flex items-center gap-3 mt-1">
                    {analysis.affectsMeCount > 0 && (
                        <span className={`text-xs ${subTextColors[analysis.colorClass]}`}>
                            {analysis.affectsMeCount} directly {analysis.affectsMeCount === 1 ? 'affects' : 'affect'} you
                        </span>
                    )}
                    
                    {analysis.locationInsight && (
                        <span className={`text-xs ${subTextColors[analysis.colorClass]}`}>
                            📍 {analysis.locationInsight}
                        </span>
                    )}
                    
                    {analysis.criticalCount > 0 && (
                        <span className={`text-xs ${subTextColors[analysis.colorClass]}`}>
                            🔴 {analysis.criticalCount} critical
                        </span>
                    )}
                </div>
            </div>
            
            {/* Quick action indicator */}
            {analysis.safetyLevel === 'critical' && (
                <span className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                    Action needed
                </span>
            )}
            
            {analysis.safetyLevel === 'elevated' && (
                <span className="text-xs font-medium px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    Monitor
                </span>
            )}
        </div>
    )
}