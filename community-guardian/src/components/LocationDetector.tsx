'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { usePreferences } from '@/hooks/usePreferences'
import { apiClient } from '@/lib/api-client'

interface LocationDetectorProps {
  onLocationUpdate?: (location: string, coordinates: { lat: number; lng: number }) => void
}

export default function LocationDetector({ onLocationUpdate }: LocationDetectorProps) {
  const preferences = useStore((s) => s.preferences)
  const { updatePreferences } = usePreferences()
  
  const [isDetecting, setIsDetecting] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(preferences?.location_enabled || false)
  const [userLocation, setUserLocation] = useState(preferences?.user_location || '')
  const [locationRadius, setLocationRadius] = useState(preferences?.location_radius || 25)
  const [error, setError] = useState('')

  // Auto-detect location using browser geolocation
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsDetecting(true)
    setError('')

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords
      
      // Reverse geocoding to get address (you might want to use a real geocoding service)
      const locationName = await reverseGeocode(latitude, longitude)
      
      setUserLocation(locationName)
      
      // Update preferences
      await updatePreferences({
        user_location: locationName,
        user_coordinates: { lat: latitude, lng: longitude },
        location_enabled: true
      })

      onLocationUpdate?.(locationName, { lat: latitude, lng: longitude })
    } catch (err) {
      setError('Failed to detect location. Please check your permissions.')
      console.error('Geolocation error:', err)
    } finally {
      setIsDetecting(false)
    }
  }

  // Simple reverse geocoding (in production, use a real service like Google Maps API)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // For now, return coordinates as location
    // In production, you'd call a geocoding API
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  // Manual location entry
  const handleManualLocation = async (location: string) => {
    setUserLocation(location)
    
    // In production, you'd geocode this address to get coordinates
    await updatePreferences({
      user_location: location,
      location_enabled: true
    })
  }

  // Toggle location services
  const toggleLocation = async (enabled: boolean) => {
    setLocationEnabled(enabled)
    await updatePreferences({ location_enabled: enabled })
    
    if (!enabled) {
      setUserLocation('')
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
          📍 Location Settings
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Get location-specific alerts relevant to your area.
        </p>
      </div>

      {/* Location Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Location Services
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locationEnabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <button
          onClick={() => toggleLocation(!locationEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            locationEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              locationEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {locationEnabled && (
        <>
          {/* Auto-detect Button */}
          <div>
            <button
              onClick={detectLocation}
              disabled={isDetecting}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg border-2 border-dashed border-blue-300 text-blue-600 dark:border-blue-600 dark:text-blue-400 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDetecting ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                  Detecting location...
                </>
              ) : (
                <>
                  📍 Auto-detect my location
                </>
              )}
            </button>
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
            )}
          </div>

          {/* Manual Location Entry */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Or enter your location manually
            </label>
            <input
              type="text"
              value={userLocation}
              onChange={(e) => handleManualLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA"
              className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Location Radius */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Alert radius: {locationRadius} miles
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={locationRadius}
              onChange={(e) => {
                const radius = Number(e.target.value)
                setLocationRadius(radius)
                updatePreferences({ location_radius: radius })
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>5 miles</span>
              <span>100 miles</span>
            </div>
          </div>

          {/* Current Location Display */}
          {userLocation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">📍</span>
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Your location
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {userLocation} • {locationRadius} mile radius
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
