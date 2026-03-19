'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ResolveButton({ alertId }: { alertId: string }) {
  const router = useRouter()
  const [isResolving, setIsResolving] = useState(false)

  async function handleResolve() {
    if (!confirm('Are you sure you want to mark this alert as resolved?')) return

    setIsResolving(true)
    try {
      const res = await fetch(`/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolved: true }),
      })

      if (!res.ok) throw new Error('Failed to resolve')

      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Encountered an error marking the incident as resolved.")
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <button
      onClick={handleResolve}
      disabled={isResolving}
      className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
    >
      {isResolving ? 'Resolving...' : 'Mark as Resolved'}
    </button>
  )
}
