'use client'

import { useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { apiClient } from '@/lib/api-client'
import type { Guardian } from '@/types/alert'

export function useGuardians() {
    const store = useStore()

    const fetchGuardians = useCallback(async () => {
        try {
            const response = await apiClient.getGuardians()
            
            if (response.error) {
                return []
            }
            
            store.setGuardians(response.data ?? [])
            return (response.data ?? []) as Guardian[]
        } catch (e) {
            return []
        }
    }, [store])

    const addGuardian = useCallback(
        async (name: string, label?: string) => {
            const response = await apiClient.createGuardian({ name, label })
            
            if (response.error) {
                throw new Error(response.error)
            }
            
            store.addGuardian(response.data)
            return response.data as Guardian
        },
        [store]
    )

    const removeGuardian = useCallback(
        async (id: string) => {
            store.removeGuardian(id) // optimistic
            
            const response = await apiClient.deleteGuardian(id)
            
            if (response.error) {
                // Could implement revert logic here if needed
            }
        },
        [store]
    )

    return { fetchGuardians, addGuardian, removeGuardian }
}