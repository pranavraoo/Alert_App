'use client'

import { useEffect, useRef } from 'react'
import { usePreferences } from '@/hooks/usePreferences'

export default function PreferencesLoader() {
  const { fetchPreferences } = usePreferences()
  const hasLoaded = useRef(false)

  useEffect(() => {
    // Only load preferences once to prevent multiple calls
    if (!hasLoaded.current) {
      console.log('Loading initial preferences...')
      fetchPreferences()
      hasLoaded.current = true
    }
  }, [fetchPreferences])

  // This component doesn't render anything visible
  return null
}
