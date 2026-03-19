import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { apiClient } from '@/lib/api-client'

export function useTheme() {
    const preferences = useStore((s) => s.preferences)
    const setPrefs = useStore((s) => s.setPreferences)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const root = document.documentElement
        
        // Only apply theme if we have preferences
        if (!preferences) {
            // Set a default theme based on system preference while loading
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            root.classList.remove('dark', 'light')
            root.classList.add(prefersDark ? 'dark' : 'light')
            return
        }
        
        // Remove existing theme classes first
        root.classList.remove('dark', 'light')
        
        if (preferences.theme === 'dark') {
            root.classList.add('dark')
        } else if (preferences.theme === 'light') {
            root.classList.add('light')
        } else {
            // system
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            root.classList.add(prefersDark ? 'dark' : 'light')
        }
    }, [preferences?.theme, mounted])

    const setTheme = async (theme: 'light' | 'dark' | 'system') => {
        // Don't do anything if preferences aren't loaded yet
        if (!preferences) {
            console.warn('Cannot set theme: preferences not loaded yet')
            return
        }

        // Update UI immediately for better UX
        setPrefs({ ...preferences, theme })

        try {
            const response = await apiClient.updatePreferences({ theme })
            
            if (response.error) {
                console.error('Failed to update theme:', response.error)
                // Revert the change if API call failed
                setPrefs({ ...preferences, theme: preferences.theme })
                return
            }
        } catch (error) {
            console.error('Theme update failed:', error)
            // Revert the change if API call failed
            setPrefs({ ...preferences, theme: preferences.theme })
        }
    }

    return { theme: preferences?.theme ?? 'system', setTheme, mounted }
}