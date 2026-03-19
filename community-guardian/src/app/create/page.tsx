'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateAlertPage() {
  const router = useRouter()
  const [pasteText, setPasteText] = useState('')
  const [isCategorizing, setIsCategorizing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Other',
    severity: 'low',
    location: '',
  })

  async function handleCategorize() {
    if (!pasteText.trim()) return
    setIsCategorizing(true)
    try {
      const res = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      })
      if (!res.ok) throw new Error('Categorization failed')

      const data = await res.json()
      setForm((prev) => ({
        ...prev,
        title: data.summary || 'Incident Report',
        description: pasteText,
        category: data.category || prev.category,
        severity: data.severity || prev.severity,
      }))
    } catch (error) {
      console.error(error)
      alert("Failed to categorize text via AI. Please fill the form manually.")
    } finally {
      setIsCategorizing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: new Date().toISOString(),
          source: 'User Report',
        }),
      })
      if (!res.ok) throw new Error('Failed to submit alert')

      router.push('/alerts')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Failed to submit incident report.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/alerts" className="text-gray-500 hover:text-black transition-colors">
          &larr; Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Report an Incident</h1>
          <p className="text-gray-500 mt-2">Submit a new issue to the community board.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Step 1: Paste Area */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-start gap-4 h-fit">
          <div className="w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Paste Raw Report</h2>
            <p className="text-sm text-gray-500 mb-4">
              Paste unstructured community text (e.g., from WhatsApp or Facebook) and let our AI categorize it automatically.
            </p>
            <textarea
              className="w-full h-40 rounded-md border border-gray-300 px-4 py-3 focus:ring-black focus:border-black text-sm"
              placeholder="e.g. Someone broke the window at the community center last night around 10pm..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
          </div>
          <button
            onClick={handleCategorize}
            disabled={isCategorizing || !pasteText.trim()}
            className="w-full bg-black text-white px-4 py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            {isCategorizing ? 'Analyzing with AI...' : 'AI Categorize & Autofill'}
          </button>
        </div>

        {/* Step 2: Manual Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">2. Review & Submit Details</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                required
                type="text"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-black focus:border-black"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-black focus:border-black bg-white"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Safety">Safety</option>
                  <option value="Noise">Noise</option>
                  <option value="Suspicious Activity">Suspicious Activity</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity / Priority</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-black focus:border-black bg-white"
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Details (Optional)</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-black focus:border-black"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
              <textarea
                required
                className="w-full h-24 rounded-md border border-gray-300 px-4 py-2 focus:ring-black focus:border-black text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <hr className="my-2 border-gray-100" />

            <button
              type="submit"
              disabled={isSubmitting || !form.title.trim() || !form.description.trim()}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300"
            >
              {isSubmitting ? 'Submitting to system...' : 'Submit Incident'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
