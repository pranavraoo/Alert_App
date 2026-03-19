'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'

const EXAMPLES = [
    'What phishing scams are active right now?',
    'Any critical CVEs this week?',
    'What should I do about data breaches?',
    'Are there local safety incidents nearby?',
]

export default function ThreatQuery() {
    const [query, setQuery] = useState('')
    const [answer, setAnswer] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleQuery = async (q: string) => {
        if (!q.trim()) return
        setLoading(true)
        setAnswer('')
        setError('')

        try {
            const response = await apiClient.query({ question: q })
            
            if (response.error) {
                throw new Error(response.error)
            }
            
            setAnswer(response.data?.answer ?? 'No answer available.')
        } catch {
            setError('Search unavailable right now. Browse alerts below.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl
                    border border-slate-200 dark:border-slate-700 p-4 space-y-3">

            <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    🔎 Ask about threats
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ask a question about current alerts and threats.
                </p>
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuery(query)}
                    placeholder="Ask anything about current threats..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg
                     border border-slate-200 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     text-slate-800 dark:text-slate-100
                     placeholder:text-slate-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={() => handleQuery(query)}
                    disabled={loading || !query.trim()}
                    className="px-4 py-2 text-sm font-medium rounded-lg
                     bg-blue-600 text-white hover:bg-blue-700
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
                >
                    {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white
                             border-t-transparent rounded-full animate-spin" />
                    ) : 'Ask'}
                </button>
            </div>

            {/* Example prompts */}
            {!answer && !loading && (
                <div className="flex flex-wrap gap-1.5">
                    {EXAMPLES.map((ex) => (
                        <button
                            key={ex}
                            onClick={() => {
                                setQuery(ex)
                                handleQuery(ex)
                            }}
                            className="px-2 py-1 text-xs rounded-lg
                         bg-slate-100 dark:bg-slate-700
                         text-slate-600 dark:text-slate-400
                         hover:bg-slate-200 dark:hover:bg-slate-600
                         transition-colors"
                        >
                            {ex}
                        </button>
                    ))}
                </div>
            )}

            {/* Answer */}
            {answer && (
                <div className="px-3 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/30
                        border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        {answer}
                    </p>
                    <button
                        onClick={() => { setAnswer(''); setQuery('') }}
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400
                       hover:underline"
                    >
                        Ask another question
                    </button>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50
                        border border-slate-200 dark:border-slate-600">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
                </div>
            )}
        </div>
    )
}