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
        if (!mounted || !preferences) return

        const root = document.documentElement
        if (preferences.theme === 'dark') {
            root.classList.add('dark')
        } else if (preferences.theme === 'light') {
            root.classList.remove('dark')
        } else {
            // system
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            prefersDark ? root.classList.add('dark') : root.classList.remove('dark')
        }
    }, [preferences?.theme, mounted])

    const setTheme = async (theme: 'light' | 'dark' | 'system') => {
        const response = await apiClient.updatePreferences({ theme })
        
        if (response.error) {
            console.error('Failed to update theme:', response.error)
            return
        }
        
        if (preferences) {
            setPrefs({ ...preferences, theme })
        }
    }

    return { theme: preferences?.theme ?? 'system', setTheme, mounted }
}