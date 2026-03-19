'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { useGuardians } from '@/hooks/useGuardians'
import type { Guardian } from '@/types/alert'

const LABELS = ['Family', 'Neighbor', 'Friend', 'Colleague', 'Other']

export default function GuardianCircle() {
    const guardians = useStore((s) => s.guardians)
    const { addGuardian, removeGuardian } = useGuardians()

    const [name, setName] = useState('')
    const [label, setLabel] = useState('Family')
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState<string | null>(null)

    const handleAdd = async () => {
        if (!name.trim()) {
            setError('Please enter a name.')
            return
        }
        setError('')
        setAdding(true)
        try {
            await addGuardian(name.trim(), label)
            setName('')
            setLabel('Family')
        } catch (e: any) {
            setError(e.message ?? 'Failed to add guardian.')
        } finally {
            setAdding(false)
        }
    }

    const handleShare = (guardian: Guardian) => {
        const msg = `From Community Guardian: I have ${guardians.length
            } trusted guardians. Stay safe! View my digest: ${window.location.origin
            }/shared/digest/default`
        navigator.clipboard.writeText(msg)
        setCopied(guardian.id)
        setTimeout(() => setCopied(null), 2000)
    }

    const handleCopyStatus = () => {
        const msg = `From Community Guardian: I'm monitoring local safety alerts. View my digest: ${window.location.origin}/shared/digest/default`
        navigator.clipboard.writeText(msg)
        setCopied('status')
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div className="space-y-4">

            {/* Header */}
            <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Guardian Circle
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Add up to 5 trusted contacts to share safety updates with.
                </p>
            </div>

            {/* Guardian list */}
            {guardians.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    No guardians added yet.
                </p>
            ) : (
                <div className="space-y-2">
                    {guardians.map((g) => (
                        <div
                            key={g.id}
                            className="flex items-center justify-between px-3 py-2
                         rounded-lg border border-slate-200 dark:border-slate-600
                         bg-slate-50 dark:bg-slate-700/50"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg">👤</span>
                                <div>
                                    <p className="text-sm font-medium text-slate-700
                                 dark:text-slate-300">
                                        {g.name}
                                    </p>
                                    {g.label && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            {g.label}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleShare(g)}
                                    className="text-xs text-blue-600 dark:text-blue-400
                             hover:underline"
                                >
                                    {copied === g.id ? '✓ Copied!' : 'Share'}
                                </button>
                                <button
                                    onClick={() => removeGuardian(g.id)}
                                    aria-label={`Remove ${g.name}`}
                                    className="text-xs text-slate-400 hover:text-red-500
                             dark:text-slate-500 dark:hover:text-red-400
                             transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add guardian form */}
            {guardians.length < 5 && (
                <div className="space-y-2 pt-2 border-t border-slate-100
                        dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Add guardian ({guardians.length}/5)
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                setError('')
                            }}
                            placeholder="Name"
                            maxLength={50}
                            className="flex-1 px-3 py-1.5 text-sm rounded-lg
                         border border-slate-200 dark:border-slate-600
                         bg-white dark:bg-slate-800
                         text-slate-800 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="px-2 py-1.5 text-sm rounded-lg
                         border border-slate-200 dark:border-slate-600
                         bg-white dark:bg-slate-800
                         text-slate-800 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {LABELS.map((l) => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAdd}
                            disabled={adding}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg
                         bg-blue-600 text-white hover:bg-blue-700
                         disabled:opacity-50 transition-colors"
                        >
                            {adding ? '...' : 'Add'}
                        </button>
                    </div>
                    {error && (
                        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                    )}
                </div>
            )}

            {/* Copy status message */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                    onClick={handleCopyStatus}
                    className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg
                     border border-slate-200 dark:border-slate-600
                     text-slate-600 dark:text-slate-400
                     hover:bg-slate-50 dark:hover:bg-slate-700
                     transition-colors w-full"
                >
                    <span>{copied === 'status' ? '✓' : '📋'}</span>
                    <span>
                        {copied === 'status'
                            ? 'Copied to clipboard!'
                            : 'Copy status message for WhatsApp/SMS'
                        }
                    </span>
                </button>
            </div>
        </div>
    )
}