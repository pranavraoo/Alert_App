import { useCallback } from 'react'
import { useStore } from '@/store/useStore'
import type { Alert } from '@/types/alert'
import type { Filters } from '@/components/FilterBar'
import { apiClient, type PaginatedAlertsResponse } from '@/lib/api-client'

export function useAlerts() {
    const store = useStore()

    const fetchAlerts = useCallback(
        async (filters?: Partial<Filters & { page?: number; limit?: number; view?: string }>) => {
            store.setLoading(true)
            try {
                const params: Record<string, any> = {}
                if (filters?.category) params.category = filters.category
                if (filters?.severity) params.severity = filters.severity
                if (filters?.status) params.status = filters.status
                if (filters?.source) params.source = filters.source
                if (filters?.location) params.location = filters.location
                if (filters?.affects_me) params.affects_me = 'true'
                if (filters?.search) params.search = filters.search
                if (filters?.page) params.page = filters.page.toString()
                if (filters?.limit) params.limit = filters.limit.toString()
                if ((filters as any)?.view) params.view = (filters as any).view

                const response = await apiClient.getAlerts(params)
                
                if (response.error) {
                    store.setAlerts([])
                    return { data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0, hasNext: false, hasPrev: false } }
                }

                // Extract the paginated response from the API response wrapper
                const paginatedResponse = response.data as PaginatedAlertsResponse
                store.setAlerts(paginatedResponse.data ?? [])
                return paginatedResponse
            } catch (e) {
                store.setAlerts([])
                return { data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0, hasNext: false, hasPrev: false } }
            } finally {
                store.setLoading(false)
            }
        },
        [store]
    )

    const createAlert = useCallback(
        async (data: Partial<Alert>) => {
            const response = await apiClient.createAlert(data)
            
            if (response.error) {
                throw new Error(response.error)
            }
            
            store.addAlert(response.data)
            return response.data as Alert
        },
        [store]
    )

    const updateAlert = useCallback(
        async (id: string, updates: Partial<Alert>) => {
            store.updateAlert(id, updates) // optimistic
            
            const response = await apiClient.updateAlert(id, updates)
            
            if (response.error) {
                // Revert optimistic update if it fails
                // Could implement revert logic here if needed
            }
        },
        [store]
    )

    const fetchAlert = useCallback(
        async (id: string): Promise<Alert | null> => {
            try {
                const response = await apiClient.getAlert(id)
                
                if (response.error || !response.data) {
                    return null
                }
                
                return response.data as Alert
            } catch (e) {
                return null
            }
        },
        []
    )

    return { fetchAlerts, createAlert, updateAlert, fetchAlert }
}