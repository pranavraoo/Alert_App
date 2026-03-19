'use client'

import { useCallback } from 'react'
import { useStore } from '@/store/useStore'
import type { Alert } from '@/types/alert'
import type { Filters } from '@/components/FilterBar'
import { apiBaseUrl } from '@/lib/apiBase'

export function useAlerts() {
    const store = useStore()

    const fetchAlerts = useCallback(
        async (filters?: Partial<Filters>) => {
            store.setLoading(true)
            try {
                const params = new URLSearchParams()
                if (filters?.category) params.set('category', filters.category)
                if (filters?.severity) params.set('severity', filters.severity)
                if (filters?.status) params.set('status', filters.status)
                if (filters?.source) params.set('source', filters.source)
                if (filters?.location) params.set('location', filters.location)
                if (filters?.affects_me) params.set('affects_me', 'true')
                if (filters?.search) params.set('search', filters.search)

                const res = await fetch(`${apiBaseUrl()}/alerts?${params.toString()}`)
                const alerts = await res.json()  // backend returns array directly

                store.setAlerts(alerts ?? [])
                return (alerts?.length ?? 0) as number
            } catch (e) {
                console.error('Failed to fetch alerts', e)
                store.setAlerts([])
                return 0
            } finally {
                store.setLoading(false)
            }
        },
        [store]
    )

    const createAlert = useCallback(
        async (data: Partial<Alert>) => {
            const res = await fetch(`${apiBaseUrl()}/alerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            const alert = await res.json()
            store.addAlert(alert)
            return alert as Alert
        },
        [store]
    )

    const updateAlert = useCallback(
        async (id: string, updates: Partial<Alert>) => {
            store.updateAlert(id, updates) // optimistic
            await fetch(`${apiBaseUrl()}/alerts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            })
        },
        [store]
    )

    const fetchAlert = useCallback(
        async (id: string): Promise<Alert | null> => {
            const res = await fetch(`${apiBaseUrl()}/alerts/${id}`)
            if (!res.ok) return null
            return res.json()
        },
        []
    )

    return { fetchAlerts, createAlert, updateAlert, fetchAlert }
}