'use client'

import { useState } from 'react'

export default function PrivacyPolicy() {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-blue-600 dark:text-blue-400 text-lg">🔒</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            Privacy & Data Protection
          </h3>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Your privacy is respected. No tracking without consent.
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
      >
        {showDetails ? 'Hide' : 'Show'} Privacy Details
      </button>

      {showDetails && (
        <div className="space-y-2 text-xs text-blue-700 dark:text-blue-400">
          <div>
            <strong>📍 Location Data:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Location is opt-in only (never automatic)</li>
              <li>• You can enable/disable location anytime</li>
              <li>• Location stored as preference, not tracked</li>
              <li>• Used only to show relevant local alerts</li>
            </ul>
          </div>

          <div>
            <strong>🗄️ Data Storage:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Only preferences stored locally</li>
              <li>• No personal information collected</li>
              <li>• No third-party data sharing</li>
              <li>• Data encrypted in transit and storage</li>
            </ul>
          </div>

          <div>
            <strong>🤖 AI & Privacy:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• No personal data sent to AI providers</li>
              <li>• AI only processes threat descriptions</li>
              <li>• Local processing when possible</li>
              <li>• AI data not used for training</li>
            </ul>
          </div>

          <div>
            <strong>🔐 Your Rights:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Delete all data anytime</li>
              <li>• Export your data on request</li>
              <li>• Opt-out of location features</li>
              <li>• Clear preferences and start fresh</li>
            </ul>
          </div>

          <div>
            <strong>⚡ Data Retention:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Preferences kept until you delete them</li>
              <li>• Verification votes kept for transparency</li>
              <li>• No automatic data purging</li>
              <li>• You control data deletion</li>
            </ul>
          </div>

          <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
            <strong>🛡️ Security Commitment:</strong>
            <p className="mt-1">
              We use industry-standard encryption and security practices. 
              Your data is never sold, rented, or shared with third parties for marketing.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
