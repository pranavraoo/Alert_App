'use client'

import { useEffect, useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { useAlerts } from '@/hooks/useAlerts'
import AlertCard from '@/components/AlertCard'
import SafetyPulse from '@/components/SafetyPulse'
import ThreatQuery from '@/components/ThreatQuery'
import SmartFilterBar, { DEFAULT_FILTERS, type Filters } from '@/components/SmartFilterBar'
import SkeletonList from '@/components/SkeletonList'
import TrendChart from '@/components/TrendChart'
import type { Alert } from '@/types/alert'

export default function AlertsPage() {
  const { fetchAlerts } = useAlerts()
  const alerts = useStore((s) => s.alerts)
  const loading = useStore((s) => s.loading)

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [total, setTotal] = useState(0)
  const [lastChecked, setLastChecked] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  })

  const load = useCallback(async (f: Filters) => {
    const result = await fetchAlerts(f)
    
    // Handle the new paginated response format with defensive checks
    if (result && result.pagination) {
      setPagination(result.pagination)
      setTotal(result.pagination.total)
    } else {
      // Fallback to default pagination if something goes wrong
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false
      })
      setTotal(0)
    }
    
    setLastChecked(new Date().toLocaleTimeString())
  }, [fetchAlerts])

  // Separate function for pagination to avoid FilterBar issues
  const goToPage = useCallback(async (page: number) => {
    const filtersWithPage = { ...filters, page }
    const result = await fetchAlerts(filtersWithPage)
    
    if (result && result.pagination) {
      setPagination(result.pagination)
      setTotal(result.pagination.total)
    }
  }, [fetchAlerts, filters])

  // On mount: load alerts
  useEffect(() => {
    const init = async () => {
      await load(DEFAULT_FILTERS)
    }
    init()
  }, [])

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

      {/* Threat Query */}
      <ThreatQuery />

      {/* Trend Chart */}
      <TrendChart filters={filters} />

      {/* Filter Bar */}
      <SmartFilterBar
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
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
          
          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between py-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} alerts
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToPage(1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                  aria-label="First page"
                >
                  «
                </button>
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Next
                </button>
                <button
                  onClick={() => goToPage(pagination.pages)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                  aria-label="Last page"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}