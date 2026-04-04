'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Alert } from '@/types/alert'
import AlertCard from './AlertCard'
import ReactMarkdown from 'react-markdown'

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
    const [referencedAlerts, setReferencedAlerts] = useState<Alert[]>([])

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
            setReferencedAlerts(response.data?.referencedAlerts ?? [])
        } catch {
            setError('Search unavailable right now. Browse alerts below.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl
                    border border-slate-200 dark:border-slate-700 p-4 space-y-4 shadow-sm">

            <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span className="text-base">🔎</span> Ask about threats
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ask a question about current alerts and threats
                </p>
            </div>

            {/* Input Group */}
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuery(query)}
                        placeholder="e.g. 'Is there any phishing in my area?'"
                        className="w-full px-4 py-2.5 text-sm rounded-xl
                         border border-slate-200 dark:border-slate-700
                         bg-slate-50/50 dark:bg-slate-900/50
                         text-slate-800 dark:text-slate-100
                         placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50
                         transition-all group-hover:border-slate-300 dark:group-hover:border-slate-600"
                    />
                </div>
                <button
                    onClick={() => handleQuery(query)}
                    disabled={loading || !query.trim()}
                    className="px-6 py-2.5 text-sm font-semibold rounded-xl
                     bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all active:scale-95"
                >
                    {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white
                             border-t-transparent rounded-full animate-spin" />
                    ) : 'Search'}
                </button>
            </div>

            {/* Example prompts */}
            {!answer && !loading && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {EXAMPLES.map((ex) => (
                        <button
                            key={ex}
                            onClick={() => {
                                setQuery(ex)
                                handleQuery(ex)
                            }}
                            className="px-3 py-1.5 text-[11px] font-medium rounded-full
                         bg-slate-100 dark:bg-slate-700/50
                         text-slate-600 dark:text-slate-400
                         border border-slate-200/50 dark:border-slate-700/50
                         hover:bg-slate-200 dark:hover:bg-slate-700
                         hover:border-slate-300 dark:hover:border-slate-600
                         transition-all"
                        >
                            {ex}
                        </button>
                    ))}
                </div>
            )}

            {/* Answer Display */}
            {answer && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="px-5 py-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20
                            border border-blue-100 dark:border-blue-800/50 relative overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16" />

                        <div className="prose prose-sm dark:prose-invert max-w-none 
                                     text-[13px] text-slate-600 dark:text-slate-300 leading-normal
                                     prose-headings:text-slate-800 dark:prose-headings:text-white
                                     prose-headings:text-sm prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-1.5
                                     prose-p:mb-2 prose-strong:text-blue-600 dark:prose-strong:text-blue-400
                                     prose-ul:my-1.5 prose-ul:list-disc prose-ul:ml-4 prose-li:my-0.5">
                            <ReactMarkdown>
                                {answer
                                    .replace(/^### /g, '\n### ') // Ensure first header has newline if at start
                                    .replace(/\n(### [^\n]+)/g, '\n\n$1') // Double newline before all headers
                                    .replace(/\n([-*] )/g, '\n\n$1') // Double newline before all bullets
                                    .trim()}
                            </ReactMarkdown>
                        </div>

                        <div className="mt-2 flex items-center justify-between border-t border-blue-100/50 dark:border-blue-800/50 pt-3">
                            <button
                                onClick={() => { 
                                    setAnswer(''); 
                                    setQuery(''); 
                                    setReferencedAlerts([]);
                                }}
                                className="text-xs font-semibold text-blue-600 dark:text-blue-400
                               hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                ← New Search
                            </button>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 dark:text-blue-500/60">
                                AI Generated Response
                            </span>
                        </div>
                    </div>

                    {/* Related Alerts Section */}
                    {referencedAlerts.length > 0 && (
                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                            <div className="flex items-center gap-3 ml-1">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Source Material & Related Alerts
                                </h4>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700/50" />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                {referencedAlerts.map((alert) => (
                                    <AlertCard key={alert.id} alert={alert} />
                                ))}
                            </div>
                        </div>
                    )}
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