'use client'

import { useState, useMemo, useEffect } from 'react'
import type { AlertSource } from '@/types/alert'
import { useStore } from '@/store/useStore'

interface Props {
    alertId: string
    source: AlertSource
    affectsMe: boolean
    onToggle: (val: boolean) => void
    alertLocation?: string
    alertCategory?: string
    alertSeverity?: string
}

export default function AffectsMe({ 
    alertId, 
    source, 
    affectsMe, 
    onToggle, 
    alertLocation, 
    alertCategory, 
    alertSeverity 
}: Props) {
    const [loading, setLoading] = useState(false)
    const preferences = useStore((s) => s.preferences)
    
    // Auto-detection logic
    const shouldAutoDetect = useMemo(() => {
        // Only show for CISA and NVD, or if location is enabled
        const isRelevantSource = source === 'CISA' || source === 'NVD'
        const hasLocationEnabled = preferences?.location_enabled
        const isHighSeverity = alertSeverity === 'critical' || alertSeverity === 'high'
        
        return isRelevantSource || hasLocationEnabled || isHighSeverity
    }, [source, preferences?.location_enabled, alertSeverity])
    
    // Auto-detection based on user preferences and location
    const autoDetected = useMemo(() => {
        if (!shouldAutoDetect) return null
        
        // Auto-detect based on user concerns
        const userConcerns = preferences?.concerns || []
        if (userConcerns.length > 0 && alertCategory) {
            const matchesConcern = userConcerns.some(concern => 
                alertCategory.toLowerCase().includes(concern.toLowerCase()) ||
                concern.toLowerCase().includes(alertCategory.toLowerCase())
            )
            if (matchesConcern) return true
        }
        
        // Auto-detect based on location proximity
        if (preferences?.location_enabled && alertLocation) {
            // This would ideally use the actual distance from the alert
            // For now, we'll use a simple keyword match
            const userLocation = preferences.user_location?.toLowerCase() || ''
            const alertLoc = alertLocation.toLowerCase()
            
            // Check if alert location contains user's location or nearby areas
            if (userLocation && alertLoc.includes(userLocation)) {
                return true
            }
            
            // Check for common nearby indicators
            const nearbyIndicators = ['near', 'close to', 'downtown', 'uptown', 'central']
            if (nearbyIndicators.some(indicator => alertLoc.includes(indicator))) {
                return true
            }
        }
        
        // Auto-detect critical/high severity alerts
        if (alertSeverity === 'critical' || alertSeverity === 'high') {
            return true
        }
        
        return false
    }, [shouldAutoDetect, preferences, alertLocation, alertCategory, alertSeverity])
    
    // Auto-apply detection if user hasn't manually set preference
    useEffect(() => {
        if (autoDetected !== null && affectsMe === false && autoDetected === true) {
            // Only auto-enable if user hasn't explicitly disabled
            onToggle(true)
        }
    }, [autoDetected, affectsMe, onToggle])
    
    const handleToggle = async () => {
        setLoading(true)
        onToggle(!affectsMe)
        setLoading(false)
    }
    
    // Don't show if not relevant
    if (!shouldAutoDetect) return null
    
    // Show auto-detected state with option to override
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleToggle}
                disabled={loading}
                aria-label={affectsMe ? 'Mark as not affecting me' : 'Mark as affecting me'}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg
                      border font-medium transition-colors
                      ${affectsMe
                        ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }
                      disabled:opacity-50`}
            >
                {affectsMe ? '✓ Affects me' : '+ This affects me'}
            </button>
            
            {/* Auto-detection indicator */}
            {autoDetected && (
                <span className="text-xs text-amber-600 dark:text-amber-400" title="Auto-detected based on your preferences and location">
                    🤖
                </span>
            )}
            
            {/* Location proximity indicator */}
            {preferences?.location_enabled && alertLocation && (
                <span className="text-xs text-blue-600 dark:text-blue-400" title={`Location: ${alertLocation}`}>
                    📍
                </span>
            )}
        </div>
    )
}