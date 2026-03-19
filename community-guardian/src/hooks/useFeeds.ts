import { useCallback } from 'react'

export function useFeeds() {
    const triggerFeeds = useCallback(async () => {
        try {
            // Feeds disabled - using static data from database
            // Static data provides consistent, reliable alerts without external dependencies
        } catch (e) {
            console.error('Feed refresh failed', e)
        }
    }, [])

    return { triggerFeeds }
}