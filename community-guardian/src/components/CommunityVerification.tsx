'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import type { Alert } from '@/types/alert'

interface CommunityVerificationProps {
  alert: Alert
  onVerificationUpdate?: () => void
}

export default function CommunityVerification({ alert, onVerificationUpdate }: CommunityVerificationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationHistory, setVerificationHistory] = useState<any[]>([])

  // Load verification history on component mount
  useEffect(() => {
    fetchVerificationHistory()
  }, [alert.id])

  const handleVerification = async (type: 'verified' | 'fake' | 'disputed') => {
    setIsSubmitting(true)
    
    try {
      const response = await apiClient.verifyAlert(alert.id, type)

      if (response.error) {
        window.alert('Failed to submit verification. Please try again.')
        return
      }

      window.alert(`Successfully marked as ${type}!`)
      onVerificationUpdate?.()
      
      // Refresh verification history immediately
      await fetchVerificationHistory()
      
      // Also refresh the alert data to get updated verification status
      if (onVerificationUpdate) {
        onVerificationUpdate()
      }
    } catch (error) {
      console.error('Verification error:', error)
      window.alert('Error submitting verification. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchVerificationHistory = async () => {
    try {
      const response = await apiClient.getVerificationHistory(alert.id)
      
      if (!response.error) {
        setVerificationHistory(response.data || [])
      } else {
        console.error('API returned error:', response.error)
      }
    } catch (error) {
      console.error('Failed to fetch verification history:', error)
    }
  }

  const getVerificationStats = () => {
    const stats = verificationHistory.reduce((acc, verification) => {
      acc[verification.verification_type] = (acc[verification.verification_type] || 0) + verification.count
      return acc
    }, {} as Record<string, number>)

    return stats
  }

  const getVerificationBadge = (type: string) => {
    switch (type) {
      case 'verified':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'fake':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      case 'disputed':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const totalVerifications = verificationHistory.reduce((sum, v) => sum + v.count, 0)
  const verifiedCount = getVerificationStats().verified || 0
  const fakeCount = getVerificationStats().fake || 0
  const disputedCount = getVerificationStats().disputed || 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
          🏆 Community Verification
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Help the community verify this alert. Your feedback improves threat intelligence for everyone.
        </p>
      </div>

      {/* Verification Stats */}
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-3">
          Verification Status
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {verifiedCount}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Verified
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {fakeCount}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Marked Fake
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {disputedCount}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Disputed
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
              {totalVerifications}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Total
            </div>
          </div>
        </div>

        {totalVerifications > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Community Trust Score
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, (verifiedCount / totalVerifications) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 text-center">
              {Math.round((verifiedCount / totalVerifications) * 100)}% verified by community
            </div>
          </div>
        )}
      </div>

      {/* Verification Actions */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-3">
          Add Your Verification
        </h4>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleVerification('verified')}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isSubmitting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-green-50 dark:hover:bg-green-900/30'
            } bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                ✅ Mark as Verified
              </>
            )}
          </button>

          <button
            onClick={() => handleVerification('fake')}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isSubmitting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-red-50 dark:hover:bg-red-900/30'
            } bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                🚫 Mark as Fake
              </>
            )}
          </button>

          <button
            onClick={() => handleVerification('disputed')}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isSubmitting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-amber-50 dark:hover:bg-amber-900/30'
            } bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                ⚠️ Mark as Disputed
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification History */}
      {verificationHistory.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-3">
            Recent Verifications
          </h4>
          <div className="space-y-2">
            {verificationHistory.slice(0, 5).map((verification, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${getVerificationBadge(verification.verification_type)}`}
              >
                <div className="text-sm">
                  <div className="font-medium">{verification.verification_type}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {new Date(verification.latest_created).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {verification.count} vote{verification.count > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
