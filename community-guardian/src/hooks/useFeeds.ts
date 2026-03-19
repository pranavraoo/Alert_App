import { useCallback } from 'react'

export function useFeeds() {
    const triggerFeeds = useCallback(async () => {
        try {
            // Feeds disabled - using static data from database
            console.log('Feeds disabled - using static database data')
        } catch (e) {
            console.error('Feed refresh failed', e)
        }
    }, [])

    return { triggerFeeds }
}