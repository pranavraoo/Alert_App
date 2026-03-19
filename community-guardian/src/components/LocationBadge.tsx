'use client'

import type { Alert } from '@/types/alert'

interface LocationBadgeProps {
  alert: Alert
}

export default function LocationBadge({ alert }: LocationBadgeProps) {
  if (!alert.distance) return null

  const getDistanceColor = (distance: number) => {
    if (distance <= 5) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    if (distance <= 15) return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
    return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
  }

  const getDistanceIcon = (distance: number) => {
    if (distance <= 5) return '📍'
    if (distance <= 15) return '📍'
    return '📍'
  }

  return (
    <span className={`flex-shrink-0 badge ${getDistanceColor(alert.distance)}`}>
      {getDistanceIcon(alert.distance)}
      {alert.distance.toFixed(1)} mi
    </span>
  )
}
