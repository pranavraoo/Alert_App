'use client'

import { use } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAlerts } from '@/hooks/useAlerts'
import { useStore } from '@/store/useStore'
import ThreatDNA from '@/components/ThreatDNA'
import CategoryChecklist from '@/components/CategoryChecklist'
import ReadAloud from '@/components/ReadAloud'
import AffectsMe from '@/components/AffectsMe'
import ThreatReporting from '@/components/ThreatReporting'
import CommunityVerification from '@/components/CommunityVerification'
import {
  SEVERITY_STYLES,
  SOURCE_STYLES,
  CATEGORY_STYLES,
} from '@/lib/constants'
import type { Alert } from '@/types/alert'

export default function AlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { fetchAlert, updateAlert } = useAlerts()
  const storeUpdate = useStore((s) => s.updateAlert)

  const [alert, setAlert] = useState<Alert | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWhy, setShowWhy] = useState(false)
  const [allChecked, setAllChecked] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchAlert(id).then((a) => {
      setAlert(a)
      setLoading(false)
    })
  }, [id]) // eslint-disable-line

  const handleResolve = async () => {
    if (!alert) return
    const updated = { ...alert, resolved: !alert.resolved }
    setAlert(updated)
    await updateAlert(alert.id, { resolved: !alert.resolved })
  }

  const handleVerificationUpdate = () => {
    // Refresh the alert data to show updated verification status
    fetchAlert(id).then((a) => {
      setAlert(a)
    })
  }

  const handleAffectsMe = async (val: boolean) => {
    if (!alert) return
    const updated = { ...alert, affects_me: val }
    setAlert(updated)
    await updateAlert(alert.id, { affects_me: val })
  }

  const handleCopyStatus = () => {
    const msg = `I reviewed the alert "${alert?.title}" and followed the safety steps. I'm good. ✓`
    navigator.clipboard.writeText(msg)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-3">
        <p className="text-4xl">😕</p>
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Alert not found
        </p>
        <Link
          href="/alerts"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to alerts
        </Link>
      </div>
    )
  }

  const readAloudText = [
    alert.title,
    alert.summary || alert.description,
    alert.suggested_action ? `Suggested action: ${alert.suggested_action}` : '',
  ].filter(Boolean).join('. ')

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Back */}
      <Link
        href="/alerts"
        className="inline-flex items-center gap-1 text-sm text-slate-500
                   dark:text-slate-400 hover:text-slate-700
                   dark:hover:text-slate-200 transition-colors"
      >
        ← Back to alerts
      </Link>

      {/* Header card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-6 space-y-4">

        {/* DNA + title */}
        <div className="flex items-start gap-4">
          <ThreatDNA alert={alert} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100
                           leading-snug">
              {alert.title}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {new Date(alert.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
              {alert.location ? ` · ${alert.location}` : ''}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`badge ${CATEGORY_STYLES[alert.category]}`}>
            {alert.category}
          </span>
          <span className={`badge ${SEVERITY_STYLES[alert.severity]}`}>
            {alert.severity}
          </span>
          <span className={`badge ${SOURCE_STYLES[alert.source]}`}>
            {alert.source}
          </span>
          {alert.resolved && (
            <span className="badge bg-slate-100 text-slate-500
                             dark:bg-slate-700 dark:text-slate-400">
              Resolved
            </span>
          )}
          {alert.affects_me && (
            <span className="badge bg-blue-100 text-blue-700
                             dark:bg-blue-900 dark:text-blue-300">
              Affects me
            </span>
          )}
        </div>

        {/* Summary */}
        {alert.summary && (
          <p className="text-sm text-slate-600 dark:text-slate-300
                        leading-relaxed font-medium">
            {alert.summary}
          </p>
        )}

        {/* Why this category */}
        {alert.reason && (
          <div>
            <button
              onClick={() => setShowWhy((v) => !v)}
              className="text-xs text-slate-400 dark:text-slate-500
                         hover:text-slate-600 dark:hover:text-slate-300
                         transition-colors flex items-center gap-1"
            >
              {showWhy ? '▲' : '▼'} Why this category?
            </button>
            {showWhy && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400
                            pl-3 border-l-2 border-slate-200 dark:border-slate-600">
                {alert.reason}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-6 space-y-2">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Details
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {alert.description}
        </p>
      </div>

      {/* Checklist */}
      <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <CategoryChecklist
          category={alert.category}
          onAllChecked={() => setAllChecked(true)}
        />

        {/* Suggested action */}
        {alert.suggested_action && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400
                           uppercase tracking-wide mb-1">
              Suggested action
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {alert.suggested_action}
            </p>
          </div>
        )}

        {/* "I'm Good" one-tap — appears after all steps checked */}
        {allChecked && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 p-3 rounded-lg
                            bg-green-50 dark:bg-green-900/30
                            border border-green-200 dark:border-green-800">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <p className="text-xs text-green-700 dark:text-green-300 flex-1">
                You've completed all steps!
              </p>
              <button
                onClick={handleCopyStatus}
                className="text-xs font-medium text-green-700 dark:text-green-300
                           hover:underline"
              >
                {copied ? 'Copied!' : "Tell my circle I'm good"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Community Verification */}
      <CommunityVerification 
        alert={alert} 
        onVerificationUpdate={handleVerificationUpdate}
      />

      {/* Action bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-2">

          {/* Mark resolved */}
          <button
            onClick={handleResolve}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg
                        border transition-colors
                        ${alert.resolved
                ? 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                : 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/40 dark:border-green-600 dark:text-green-300'
              }`}
          >
            {alert.resolved ? '↩ Reopen' : '✓ Mark resolved'}
          </button>

          {/* Edit */}
          <Link
            href={`/alerts/${alert.id}/edit`}
            className="px-3 py-1.5 text-xs font-medium rounded-lg
                       border border-slate-200 dark:border-slate-600
                       text-slate-500 dark:text-slate-400
                       hover:bg-slate-50 dark:hover:bg-slate-700
                       transition-colors"
          >
            ✏️ Edit
          </Link>
          {/* Share */}
          <button
            onClick={handleShare}
            className="px-3 py-1.5 text-xs font-medium rounded-lg
                       border border-slate-200 dark:border-slate-600
                       text-slate-500 dark:text-slate-400
                       hover:bg-slate-50 dark:hover:bg-slate-700
                       transition-colors"
          >
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>

          {/* External link for CISA/NVD */}
          {alert.source === 'CISA' && (

            < a href={`https://www.cisa.gov/known-exploited-vulnerabilities-catalog`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium rounded-lg
                         border border-blue-200 dark:border-blue-700
                         text-blue-600 dark:text-blue-400
                         hover:bg-blue-50 dark:hover:bg-blue-900/30
                         transition-colors"
            >
              View on CISA ↗
            </a>
          )}
          {alert.source === 'NVD' && (

            < a href={`https://nvd.nist.gov/vuln/detail/${alert.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium rounded-lg
                         border border-purple-200 dark:border-purple-700
                         text-purple-600 dark:text-purple-400
                         hover:bg-purple-50 dark:hover:bg-purple-900/30
                         transition-colors"
            >
              View on NVD ↗
            </a>
          )}
        </div>
      </div>

    </div>
  )
}