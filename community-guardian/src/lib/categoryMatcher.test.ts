// Test file to demonstrate smart category matching
import { 
  matchDynamicCategory, 
  matchesConcern, 
  filterAlertsByConcerns, 
  suggestConcerns,
  getUniqueDynamicCategories
} from './categoryMatcher'

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

// Test 1: Match dynamic categories to base categories
dynamicCategories.forEach(dynamic => {
  const matches = matchDynamicCategory(dynamic)
})

// Test 2: User concerns matching
const userConcerns = ['Phishing', 'Scam']
dynamicCategories.forEach(dynamic => {
  const matches = matchesConcern(dynamic, userConcerns)
})

// Test 3: Alert filtering
const sampleAlerts = [
  { id: '1', category: 'Microsoft Account Imposter', resolved: false },
  { id: '2', category: 'Cryptocurrency Scam', resolved: false },
  { id: '3', category: 'Local safety', resolved: false },
  { id: '4', category: 'Data breach', resolved: false }
]

const filteredAlerts = filterAlertsByConcerns(sampleAlerts, ['Phishing', 'Data breach'])

// Test 4: Suggest concerns
const suggestions = suggestConcerns(dynamicCategories)
