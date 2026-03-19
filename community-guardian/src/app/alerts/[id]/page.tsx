import Link from 'next/link'
import { notFound } from 'next/navigation'
import { apiBaseUrl } from '@/lib/apiBase'
import { ResolveButton } from './ResolveButton'

type Alert = {
  id: string
  title: string
  description: string
  category: string
  severity: string
  reason?: string
  suggested_action?: string
  location?: string | null
  date: string
  resolved: boolean
  created_at: string
}

async function getAlert(id: string): Promise<Alert | null> {
  const r = await fetch(`${apiBaseUrl()}/alerts/${id}`, { cache: 'no-store' })
  if (!r.ok) return null
  return r.json()
}

const CHECKLISTS: Record<string, string[]> = {
  Infrastructure: [
    'Take clear photos of the damage from multiple angles.',
    'Ensure the immediate area is safe and cordon off if necessary.',
    'Check if utilities (water, gas, electricity) are affected and notify authorities immediately if so.',
    'Log the exact street address and nearest cross-street.',
  ],
  Safety: [
    'If this is an active emergency, call 911 immediately.',
    'Do not engage with suspicious individuals directly.',
    'Document physical descriptions and license plate numbers from a safe distance.',
    'Alert neighbors via the community group chat.',
  ],
  Noise: [
    'Log the exact time the noise began and ended.',
    'Determine the specific unit/house the noise is coming from.',
    'Attempt a polite conversation with the neighbor if it is safe to do so.',
    'Check local noise ordinance hours before filing a formal police complaint.',
  ],
  'Suspicious Activity': [
    'Record the date, time, and exact location of the activity.',
    'Note down detailed descriptions (clothing, vehicle make/model, behavior).',
    'Do not confront the individual.',
    'Share home security camera footage if available.',
  ],
}

export default async function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const alert = await getAlert(id)

  if (!alert) {
    return notFound()
  }

  const checklist = CHECKLISTS[alert.category] || [
    'Review the incident details carefully.',
    'Gather any necessary photo evidence.',
    'Contact the neighborhood board for next steps.',
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/alerts" className="text-gray-500 hover:text-black transition-colors">
          &larr; Back to Alerts
        </Link>
        {alert.resolved ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            Resolved
          </span>
        ) : (
          <ResolveButton alertId={alert.id} />
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{alert.title}</h1>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize tracking-wide
            ${alert.severity === 'critical' ? 'bg-red-500 text-white' : ''}
            ${alert.severity === 'high' ? 'bg-orange-500 text-white' : ''}
            ${alert.severity === 'medium' ? 'bg-yellow-400 text-black' : ''}
            ${alert.severity === 'low' ? 'bg-green-500 text-white' : ''}
            ${!['critical', 'high', 'medium', 'low'].includes(alert.severity?.toLowerCase()) ? 'bg-gray-800 text-white' : ''}
          `}>
            {alert.severity} Priority
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
          <p><strong>Category:</strong> {alert.category}</p>
          <p><strong>Reported:</strong> {new Date(alert.created_at).toLocaleDateString()}</p>
          {alert.location && <p><strong>Location:</strong> {alert.location}</p>}
        </div>

        <div className="prose prose-sm max-w-none text-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="whitespace-pre-wrap leading-relaxed">{alert.description}</p>

          {alert.reason && alert.reason.trim() !== '' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">AI Reasoning</h4>
              <p className="text-sm italic">{alert.reason}</p>
            </div>
          )}

          {alert.suggested_action && alert.suggested_action.trim() !== '' && (
            <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-900 text-sm mb-1">AI Suggested Action</h4>
              <p className="text-sm text-blue-800">{alert.suggested_action}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Remediation Action Plan</h2>
        <div className="space-y-4">
          {checklist.map((item, idx) => (
            <label key={idx} className="flex gap-4 p-4 items-start bg-gray-50 rounded-xl cursor-hover hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer">
              <div className="flex-shrink-0 mt-0.5">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer" />
              </div>
              <span className="text-sm text-gray-700 leading-relaxed font-medium">
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
