// Test file to demonstrate smart category matching
import { matchDynamicCategory, matchesConcern, filterAlertsByConcerns, suggestConcerns } from './categoryMatcher'

// Example dynamic categories from our sample data
const dynamicCategories = [
  'Microsoft Account Imposter',
  'Cryptocurrency Scam', 
  'Social Engineering Attack',
  'Malware Delivery',
  'Local safety',
  'Data breach',
  'Identity Theft'
]

// Test the matching logic
console.log('=== Smart Category Matching Demo ===\n')

// Test 1: Match dynamic categories to base categories
console.log('1. Dynamic Category Matching:')
dynamicCategories.forEach(dynamic => {
  const matches = matchDynamicCategory(dynamic)
  console.log(`"${dynamic}" -> ${matches.map(m => `${m.category} (${Math.round(m.confidence * 100)}%)`).join(', ')}`)
})

// Test 2: User concerns matching
console.log('\n2. User Concerns Matching:')
const userConcerns = ['Phishing', 'Scam']
dynamicCategories.forEach(dynamic => {
  const matches = matchesConcern(dynamic, userConcerns)
  console.log(`"${dynamic}" matches concerns [${userConcerns.join(', ')}]: ${matches ? '✅' : '❌'}`)
})

// Test 3: Alert filtering
console.log('\n3. Alert Filtering:')
const sampleAlerts = [
  { id: '1', category: 'Microsoft Account Imposter', resolved: false },
  { id: '2', category: 'Cryptocurrency Scam', resolved: false },
  { id: '3', category: 'Local safety', resolved: false },
  { id: '4', category: 'Data breach', resolved: false }
]

const filteredAlerts = filterAlertsByConcerns(sampleAlerts, ['Phishing', 'Data breach'])
console.log(`Filtered ${sampleAlerts.length} alerts with concerns ['Phishing', 'Data breach']:`)
filteredAlerts.forEach(alert => {
  console.log(`  - ${alert.category} ✅`)
})

// Test 4: Suggest concerns
console.log('\n4. Suggested Concerns:')
const suggestions = suggestConcerns(dynamicCategories)
console.log(`Based on dynamic categories, suggested concerns: ${suggestions.join(', ')}`)

console.log('\n=== Demo Complete ===')
