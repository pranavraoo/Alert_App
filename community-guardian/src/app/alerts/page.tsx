'use client'

import { useEffect, useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { useAlerts } from '@/hooks/useAlerts'
import { useFeeds } from '@/hooks/useFeeds'
import AlertCard from '@/components/AlertCard'
import SafetyPulse from '@/components/SafetyPulse'
import FilterBar, { DEFAULT_FILTERS, type Filters } from '@/components/FilterBar'
import SkeletonList from '@/components/SkeletonList'
import TrendChart from '@/components/TrendChart'

export default function AlertsPage() {
  const { fetchAlerts } = useAlerts()
  const { triggerFeeds } = useFeeds()
  const alerts = useStore((s) => s.alerts)
  const loading = useStore((s) => s.loading)

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [total, setTotal] = useState(0)
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  const load = useCallback(async (f: Filters) => {
    const count = await fetchAlerts(f)
    setTotal(count)
    setLastChecked(new Date().toLocaleTimeString())
  }, [fetchAlerts])

  // On mount: trigger feeds then load alerts
  useEffect(() => {
    const init = async () => {
      await triggerFeeds()  // pull fresh data from CISA/NVD/PhishTank
      await load(DEFAULT_FILTERS)
    }
    init()
  }, []) // eslint-disable-line

  // Re-fetch on filter change
  useEffect(() => {
    load(filters)
  }, [filters]) // eslint-disable-line

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Alerts
        </h1>
        <div className="flex items-center gap-2">
          {lastChecked && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Updated {lastChecked}
            </span>
          )}
          <button
            onClick={() => load(filters)}
            aria-label="Refresh alerts"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600
                       hover:bg-slate-100 dark:hover:bg-slate-700
                       transition-colors"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Safety Pulse */}
      <SafetyPulse />

      {/* Trend Chart */}
      <TrendChart alerts={alerts} />

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        total={total}
      />

      {/* List */}
      {loading ? (
        <SkeletonList count={5} />
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-4xl">🔍</p>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            No alerts match your filters
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Try clearing your filters or adding a new alert
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

    </div>
  )
}