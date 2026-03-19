// Demo to show how smart filtering works for FilterBar
import { getUniqueDynamicCategories } from './categoryMatcher'

// Sample alerts with dynamic categories
const sampleAlerts = [
  { id: '1', category: 'Microsoft Account Imposter', title: 'Urgent: Account suspended' },
  { id: '2', category: 'Cryptocurrency Scam', title: '500% returns guaranteed' },
  { id: '3', category: 'Local safety', title: 'Suspicious person at park' },
  { id: '4', category: 'Data breach', title: 'Customer data exposed' },
  { id: '5', category: 'Social Engineering Attack', title: 'Fake IT support call' },
  { id: '6', category: 'Malware Delivery', title: 'Fake software update' }
]

// 1. Get dynamic categories from alerts
const dynamicCategories = getUniqueDynamicCategories(sampleAlerts)

// 2. Smart FilterBar will show these in organized groups:
const baseCategories = ['Scam', 'Phishing', 'Imposter', 'Data breach', 'Local safety', 'CVE', 'Other']
const nonOverlappingBaseCategories = baseCategories.filter(cat => !dynamicCategories.includes(cat))

// 3. Filtering behavior
const microsoftAlerts = sampleAlerts.filter(alert => 
  alert.title.toLowerCase().includes('microsoft') || 
  alert.category.toLowerCase().includes('microsoft')
)

// 3. Filtering behavior
const cryptoAlerts = sampleAlerts.filter(alert => alert.category === 'Cryptocurrency Scam')

// 3. Filtering behavior
const affectsMeAlerts = sampleAlerts.filter(alert => alert.id === '1' || alert.id === '4') // Simulated

// 4. Live preview feature
const livePreview = '5 of 8 results'

// 5. Smart Features:
const smartFeatures = [
  'Dynamic categories appear first with "🆕" indicator',
  'Organized in optgroups for clarity',
  'Search works across title and category',
  'Live result counting',
  'Location search is partial match',
  '"Affects me" quick filter'
]

export {
  sampleAlerts,
  dynamicCategories,
  nonOverlappingBaseCategories,
  microsoftAlerts,
  cryptoAlerts,
  affectsMeAlerts,
  livePreview,
  smartFeatures
}
