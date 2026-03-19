'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAlerts } from '@/hooks/useAlerts'
import { useStore } from '@/store/useStore'
import { findSimilarAlerts } from '@/lib/similarity'
import { apiClient } from '@/lib/api-client'
import SimilarAlerts from '@/components/SimilarAlerts'
import { CATEGORIES, SEVERITIES, LOCATIONS } from '@/lib/constants'
import type { Alert, AICategorizationResult } from '@/types/alert'

type Tab = 'paste' | 'manual'

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  severity: '',
  date: new Date().toISOString().split('T')[0],
  location: '',
  summary: '',
  suggested_action: '',
  reason: '',
  confidence: 'high' as 'high' | 'low',
}

export default function CreatePage() {
  const router = useRouter()
  const { createAlert } = useAlerts()
  const alerts = useStore((s) => s.alerts)

  const [tab, setTab] = useState<Tab>('paste')
  const [pasteText, setPasteText] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categorizing, setCategorizing] = useState(false)
  const [usedFallback, setUsedFallback] = useState(false)
  const [similarAlerts, setSimilarAlerts] = useState<Alert[]>([])
  const [saving, setSaving] = useState(false)
  const [aiResult, setAiResult] = useState<AICategorizationResult | null>(null)

  // Load extension data on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).chrome?.storage) {
      (window as any).chrome.storage.local.get(['threatText', 'sourceUrl', 'linkUrl'], (result: any) => {
        if (result.threatText) {
          setPasteText(result.threatText)
          setForm(f => ({
            ...f,
            title: f.title || result.threatText.slice(0, 80),
            description: f.description || result.threatText.slice(0, 500),
            location: result.sourceUrl || f.location
          }))
          
          // Clear stored data
          ;(window as any).chrome.storage.local.remove(['threatText', 'sourceUrl', 'linkUrl'])
        }
      })
    }
  }, [])

  // ── Categorize ─────────────────────────────────────────────────────────────
  const handleCategorize = async () => {
    if (!pasteText.trim()) {
      setErrors({ paste: 'Please paste some text first.' })
      return
    }
    setErrors({})
    setCategorizing(true)
    setUsedFallback(false)

    let result: AICategorizationResult

    try {
      const response = await apiClient.categorizeText(pasteText)
      
      if (response.error) {
        setErrors({ paste: 'AI service unavailable. Using smart categorization instead.' })
        setCategorizing(false)
        return
      }
      
      result = response.data
      setUsedFallback(result.used_fallback ?? false)
      
      // Show friendly message if using fallback
      if (result.used_fallback) {
        // Enhanced smart categorization is being used
      }
    } catch {
      // If backend is unavailable, show error instead of using fallback
      setErrors({ paste: 'Unable to connect to categorization service. Please try again.' })
      setCategorizing(false)
      return
    }

    setAiResult(result)
    setForm((f) => ({
      ...f,
      title: result.title || f.title || pasteText.slice(0, 80),
      description: f.description || pasteText.slice(0, 500),
      category: result.category,
      severity: result.severity,
      summary: result.summary,
      suggested_action: result.suggested_action,
      reason: result.reason,
      confidence: result.confidence,
    }))

    // Find similar alerts from store
    const similar = findSimilarAlerts(result.category, pasteText, alerts)
    setSimilarAlerts(similar)

    setCategorizing(false)
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.title.trim() || form.title.trim().length < 3)
      e.title = 'Title must be at least 3 characters.'
    if (!form.description.trim() || form.description.trim().length < 10)
      e.description = 'Description must be at least 10 characters.'
    if (!form.category)
      e.category = 'Please select a category.'
    if (!form.severity)
      e.severity = 'Please select a severity.'
    if (!form.date)
      e.date = 'Please select a date.'
    if (form.date && new Date(form.date) > new Date())
      e.date = 'Date cannot be in the future.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const alert = await createAlert({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category as Alert['category'],
        severity: form.severity as Alert['severity'],
        summary: form.summary.trim(),
        suggested_action: form.suggested_action.trim(),
        reason: form.reason.trim(),
        confidence: form.confidence,
        source: 'User',
        location: form.location || undefined,
        date: form.date,
      })
      router.push(`/alerts/${alert.id}`)
    } catch (e) {
      setErrors({ submit: 'Failed to save alert. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const updateForm = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Create Alert
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Paste suspicious text for AI categorization, or fill in manually.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
        {(['paste', 'manual'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors
              ${tab === t
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            {t === 'paste' ? '🤖 Paste & Categorize' : '✏️ Add Manually'}
          </button>
        ))}
      </div>

      {/* Paste tab */}
      {tab === 'paste' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700
                               dark:text-slate-300 mb-1">
              Paste suspicious text
            </label>
            <textarea
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value)
                setErrors({})
              }}
              placeholder="Paste a suspicious email, SMS, social media post, or incident report here..."
              rows={6}
              className="w-full px-3 py-2 text-sm rounded-lg
                         border border-slate-200 dark:border-slate-600
                         bg-white dark:bg-slate-800
                         text-slate-800 dark:text-slate-100
                         placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         resize-none"
            />
            {errors.paste && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.paste}
              </p>
            )}
          </div>

          <button
            onClick={handleCategorize}
            disabled={categorizing}
            className="px-4 py-2 text-sm font-medium rounded-lg
                       bg-blue-600 text-white hover:bg-blue-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors flex items-center gap-2"
          >
            {categorizing ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white
                                 border-t-transparent rounded-full animate-spin" />
                Categorizing...
              </>
            ) : '🤖 Categorize'}
          </button>

          {/* Fallback warning */}
          {usedFallback && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg
                            bg-amber-50 border border-amber-200
                            dark:bg-amber-900/30 dark:border-amber-700">
              <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
              <div>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  Using fallback classification
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  AI unavailable — keyword rules used. Please verify this classification.
                </p>
              </div>
            </div>
          )}

          {/* AI result + Similar Alerts */}
          {aiResult && (
            <div className="space-y-4 pt-2">
              {/* Confidence badge */}
              <div className="flex items-center gap-2">
                <span className={`badge ${aiResult.confidence === 'high'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                  }`}>
                  {aiResult.confidence === 'high' ? '✓ High confidence' : '⚠ Low confidence — verify'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {aiResult.reason}
                </span>
              </div>

              {/* Similar alerts */}
              <SimilarAlerts alerts={similarAlerts} />
            </div>
          )}
        </div>
      )}

      {/* Form — shown for both tabs (prefilled for paste, empty for manual) */}
      {(tab === 'manual' || aiResult) && (
        <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {tab === 'paste' ? 'Review & edit before saving' : 'Alert details'}
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700
                               dark:text-slate-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              maxLength={100}
              placeholder="Brief descriptive title"
              className="w-full px-3 py-2 text-sm rounded-lg
                         border border-slate-200 dark:border-slate-600
                         bg-white dark:bg-slate-800
                         text-slate-800 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700
                               dark:text-slate-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Detailed description of the alert"
              className="w-full px-3 py-2 text-sm rounded-lg
                         border border-slate-200 dark:border-slate-600
                         bg-white dark:bg-slate-800
                         text-slate-800 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Category + Severity row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700
                                 dark:text-slate-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  list="categories-datalist"
                  id="category"
                  value={form.category}
                  onChange={(e) => updateForm('category', e.target.value)}
                  placeholder="Type or select category"
                  className="w-full px-3 py-2 text-sm rounded-lg
                             border border-slate-200 dark:border-slate-600
                             bg-white dark:bg-slate-800
                             text-slate-800 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="categories-datalist">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </datalist>
              </div>
              {errors.category && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-slate-700
                                 dark:text-slate-300 mb-1">
                Severity <span className="text-red-500">*</span>
              </label>
              <select
                id="severity"
                value={form.severity}
                onChange={(e) => updateForm('severity', e.target.value)}
                className="select-input"
              >
                <option value="">Select severity</option>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.severity && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.severity}
                </p>
              )}
            </div>
          </div>

          {/* Date + Location row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700
                                 dark:text-slate-300 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => updateForm('date', e.target.value)}
                className="select-input"
              />
              {errors.date && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700
                                 dark:text-slate-300 mb-1">
                Location
              </label>
              <select
                value={form.location}
                onChange={(e) => updateForm('location', e.target.value)}
                className="select-input"
              >
                <option value="">Select location</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* AI fields — show if categorized */}
          {aiResult && (
            <div className="space-y-3 p-3 rounded-lg bg-slate-50
                            dark:bg-slate-800/50 border border-slate-200
                            dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400
                             uppercase tracking-wide">
                AI Generated Fields
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-600
                                   dark:text-slate-400 mb-1">
                  Summary
                </label>
                <input
                  type="text"
                  value={form.summary}
                  onChange={(e) => updateForm('summary', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg
                             border border-slate-200 dark:border-slate-600
                             bg-white dark:bg-slate-800
                             text-slate-800 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600
                                   dark:text-slate-400 mb-1">
                  Suggested Action
                </label>
                <input
                  type="text"
                  value={form.suggested_action}
                  onChange={(e) => updateForm('suggested_action', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg
                             border border-slate-200 dark:border-slate-600
                             bg-white dark:bg-slate-800
                             text-slate-800 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600
                                   dark:text-slate-400 mb-1">
                  Why this category
                </label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => updateForm('reason', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg
                             border border-slate-200 dark:border-slate-600
                             bg-white dark:bg-slate-800
                             text-slate-800 dark:text-slate-100
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Submit error */}
          {errors.submit && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.submit}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium rounded-lg
                         bg-blue-600 text-white hover:bg-blue-700
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white
                                   border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : '✓ Save Alert'}
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium rounded-lg
                         border border-slate-200 dark:border-slate-600
                         text-slate-600 dark:text-slate-400
                         hover:bg-slate-50 dark:hover:bg-slate-700
                         transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}