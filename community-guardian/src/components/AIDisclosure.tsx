'use client'

import { useState } from 'react'

export default function AIDisclosure() {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-amber-600 dark:text-amber-400 text-lg">⚖️</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            AI-Powered Intelligence
          </h3>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            This system uses AI to categorize threats with human oversight
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 underline"
      >
        {showDetails ? 'Hide' : 'Show'} AI Details
      </button>

      {showDetails && (
        <div className="space-y-2 text-xs text-amber-700 dark:text-amber-400">
          <div>
            <strong>🤖 What AI Does:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Categorizes user reports into threat types</li>
              <li>• Suggests severity levels and actions</li>
              <li>• Provides threat summaries and context</li>
            </ul>
          </div>

          <div>
            <strong>🛡️ Safety Measures:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Human community verification can override AI</li>
              <li>• Rule-based fallback when AI is unavailable</li>
              <li>• Confidence levels shown for AI decisions</li>
              <li>• No AI used for critical safety decisions</li>
            </ul>
          </div>

          <div>
            <strong>⚠️ Limitations:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• AI may not understand all threat contexts</li>
              <li>• Bias may exist in training data</li>
              <li>• Always verify with official sources</li>
              <li>• Report incorrect AI categorizations</li>
            </ul>
          </div>

          <div>
            <strong>🔒 Privacy:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• No personal data sent to AI providers</li>
              <li>• Local processing when possible</li>
              <li>• Data used only for threat categorization</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
