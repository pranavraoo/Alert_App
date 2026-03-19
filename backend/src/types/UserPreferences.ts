export interface UserPreferences {
  id: string
  concerns: string[]
  severities: string[]
  theme: 'light' | 'dark' | 'system'
  quiet_start?: string | null
  quiet_end?: string | null
  updated_at: Date
  user_location?: string | null        // "San Francisco, CA"
  user_coordinates?: { lat: number; lng: number } | null     // {lat: 37.7749, lng: -122.4194}
  location_radius?: number | null    // @default(25.0) // miles
  location_enabled?: boolean | null   // @default(false)
}
