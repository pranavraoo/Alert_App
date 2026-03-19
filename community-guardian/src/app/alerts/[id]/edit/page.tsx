'use client'

import { use } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAlerts } from '@/hooks/useAlerts'
import { CATEGORIES, SEVERITIES, LOCATIONS } from '@/lib/constants'
import type { Alert } from '@/types/alert'

export default function AlertDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const { fetchAlert, updateAlert } = useAlerts()

    const [form, setForm] = useState<Partial<Alert>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        fetchAlert(id).then((a) => {
            if (a) setForm(a)
            setLoading(false)
        })
    }, [id]) // eslint-disable-line

    const update = (key: string, value: string) => {
        setForm((f) => ({ ...f, [key]: value }))
        setErrors((e) => ({ ...e, [key]: '' }))
    }

    const validate = (): boolean => {
        const e: Record<string, string> = {}
        if (!form.title?.trim() || form.title.trim().length < 3)
            e.title = 'Title must be at least 3 characters.'
        if (!form.description?.trim() || form.description.trim().length < 10)
            e.description = 'Description must be at least 10 characters.'
        if (!form.category) e.category = 'Please select a category.'
        if (!form.severity) e.severity = 'Please select a severity.'
        if (!form.date) e.date = 'Please select a date.'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSave = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            await updateAlert(id, {
                title: form.title,
                description: form.description,
                category: form.category,
                severity: form.severity,
                date: form.date,
                location: form.location,
                summary: form.summary,
                suggested_action: form.suggested_action,
                reason: form.reason,
            })
            router.push(`/alerts/${id}`)
        } catch {
            setErrors({ submit: 'Failed to save. Please try again.' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="skeleton h-8 w-48" />
                <div className="skeleton h-64 w-full rounded-xl" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Edit Alert
                </h1>
                <Link
                    href={`/alerts/${id}`}
                    className="text-sm text-slate-500 dark:text-slate-400
                     hover:text-slate-700 dark:hover:text-slate-200"
                >
                    ← Cancel
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl
                      border border-slate-200 dark:border-slate-700 p-6 space-y-4">

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-700
                             dark:text-slate-300 mb-1">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.title ?? ''}
                        onChange={(e) => update('title', e.target.value)}
                        maxLength={100}
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
                        value={form.description ?? ''}
                        onChange={(e) => update('description', e.target.value)}
                        maxLength={1000}
                        rows={4}
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

                {/* Category + Severity */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700
                               dark:text-slate-300 mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.category ?? ''}
                            onChange={(e) => update('category', e.target.value)}
                            className="select-input"
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                {errors.category}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700
                               dark:text-slate-300 mb-1">
                            Severity <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.severity ?? ''}
                            onChange={(e) => update('severity', e.target.value)}
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

                {/* Date + Location */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700
                               dark:text-slate-300 mb-1">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={form.date ?? ''}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => update('date', e.target.value)}
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
                            value={form.location ?? ''}
                            onChange={(e) => update('location', e.target.value)}
                            className="select-input"
                        >
                            <option value="">Select location</option>
                            {LOCATIONS.map((l) => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary */}
                <div>
                    <label className="block text-sm font-medium text-slate-700
                             dark:text-slate-300 mb-1">
                        Summary
                    </label>
                    <input
                        type="text"
                        value={form.summary ?? ''}
                        onChange={(e) => update('summary', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg
                       border border-slate-200 dark:border-slate-600
                       bg-white dark:bg-slate-800
                       text-slate-800 dark:text-slate-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Suggested action */}
                <div>
                    <label className="block text-sm font-medium text-slate-700
                             dark:text-slate-300 mb-1">
                        Suggested Action
                    </label>
                    <input
                        type="text"
                        value={form.suggested_action ?? ''}
                        onChange={(e) => update('suggested_action', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg
                       border border-slate-200 dark:border-slate-600
                       bg-white dark:bg-slate-800
                       text-slate-800 dark:text-slate-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

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
                        ) : '✓ Save Changes'}
                    </button>
                    <Link
                        href={`/alerts/${id}`}
                        className="px-4 py-2 text-sm font-medium rounded-lg
                       border border-slate-200 dark:border-slate-600
                       text-slate-600 dark:text-slate-400
                       hover:bg-slate-50 dark:hover:bg-slate-700
                       transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    )
}