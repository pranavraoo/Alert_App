'use client'

import { useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { apiBaseUrl } from '@/lib/apiBase'
import type { UserPreference } from '@/types/alert'

export function usePreferences() {
    const store = useStore()

    const fetchPreferences = useCallback(async () => {
        try {
            const res = await fetch(`${apiBaseUrl()}/preferences`)
            const prefs = await res.json()
            store.setPreferences(prefs)
            return prefs as UserPreference
        } catch (e) {
            console.error('Failed to fetch preferences', e)
            return null
        }
    }, [store])

    const updatePreferences = useCallback(
        async (updates: Partial<UserPreference>) => {
            try {
                // Optimistic
                if (store.preferences) {
                    store.setPreferences({ ...store.preferences, ...updates })
                }
                const res = await fetch(`${apiBaseUrl()}/preferences`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                })
                const prefs = await res.json()
                store.setPreferences(prefs)
                return prefs as UserPreference
            } catch (e) {
                console.error('Failed to update preferences', e)
                return null
            }
        },
        [store]
    )

    return { fetchPreferences, updatePreferences }
}