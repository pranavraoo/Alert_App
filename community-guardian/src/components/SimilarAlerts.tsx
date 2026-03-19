import Link from 'next/link'
import type { Alert } from '@/types/alert'
import ThreatDNA from './ThreatDNA'
import { SEVERITY_STYLES, CATEGORY_STYLES } from '@/lib/constants'

interface Props {
  alerts: Alert[]
}

export default function SimilarAlerts({ alerts }: Props) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        Similar past alerts
      </p>
      {alerts.map((alert) => (
        <Link
          key={alert.id}
          href={`/alerts/${alert.id}`}
          target="_blank"
          className="flex items-center gap-3 p-3 rounded-lg
                     border border-slate-200 dark:border-slate-600
                     bg-slate-50 dark:bg-slate-700/50
                     hover:bg-slate-100 dark:hover:bg-slate-700
                     transition-colors group"
        >
          <ThreatDNA alert={alert} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300
                          truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {alert.title}
            </p>
            <div className="flex gap-1 mt-1">
              <span className={`badge text-xs ${CATEGORY_STYLES[alert.category]}`}>
                {alert.category}
              </span>
              <span className={`badge text-xs ${SEVERITY_STYLES[alert.severity]}`}>
                {alert.severity}
              </span>
            </div>
          </div>
          <span className="text-slate-400 text-xs">→</span>
        </Link>
      ))}
    </div>
  )
}