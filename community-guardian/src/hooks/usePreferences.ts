'use client'

import { useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { apiClient } from '@/lib/api-client'
import type { UserPreference } from '@/types/alert'

export function usePreferences() {
    const store = useStore()

    const fetchPreferences = useCallback(async () => {
        try {
            const response = await apiClient.getPreferences()
            
            if (response.error) {
                console.error('Failed to fetch preferences:', response.error)
                return null
            }
            
            store.setPreferences(response.data)
            return response.data as UserPreference
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
                
                const response = await apiClient.updatePreferences(updates)
                
                if (response.error) {
                    console.error('Failed to update preferences:', response.error)
                    return null
                }
                
                store.setPreferences(response.data)
                return response.data as UserPreference
            } catch (e) {
                console.error('Failed to update preferences', e)
                return null
            }
        },
        [store]
    )

    return { fetchPreferences, updatePreferences }
}