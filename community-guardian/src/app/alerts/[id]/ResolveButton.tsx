'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

export function ResolveButton({ alertId }: { alertId: string }) {
  const router = useRouter()
  const [isResolving, setIsResolving] = useState(false)

  async function handleResolve() {
    if (!confirm('Are you sure you want to mark this alert as resolved?')) return

    setIsResolving(true)
    try {
      const response = await apiClient.updateAlert(alertId, { resolved: true })
      
      if (response.error) {
        throw new Error(response.error)
      }

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
