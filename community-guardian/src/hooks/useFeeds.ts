import { useCallback } from 'react'
import { apiBaseUrl } from '@/lib/apiBase'

export function useFeeds() {
    const triggerFeeds = useCallback(async () => {
        try {
            // Fire all three feeds in parallel
            await Promise.allSettled([
                fetch(`${apiBaseUrl()}/feeds/cisa`, { method: 'POST' }),
                fetch(`${apiBaseUrl()}/feeds/nvd`, { method: 'POST' }),
                fetch(`${apiBaseUrl()}/feeds/phishtank`, { method: 'POST' }),
            ])
        } catch (e) {
            console.error('Feed refresh failed', e)
        }
    }, [])

    return { triggerFeeds }
}