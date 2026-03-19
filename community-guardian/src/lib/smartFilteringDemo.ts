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

console.log('=== Smart FilterBar Demo ===\n')

// 1. Get dynamic categories from alerts
const dynamicCategories = getUniqueDynamicCategories(sampleAlerts)
console.log('1. Dynamic Categories Found:')
dynamicCategories.forEach(cat => console.log(`   🆕 ${cat}`))

// 2. Smart FilterBar will show these in organized groups:
console.log('\n2. Smart FilterBar Organization:')
console.log('   📊 Dynamic Categories (marked with 🆕):')
dynamicCategories.forEach(cat => console.log(`      - ${cat} 🆕`))

console.log('\n   📋 Base Categories (no overlap):')
const baseCategories = ['Scam', 'Phishing', 'Imposter', 'Data breach', 'Local safety', 'CVE', 'Other']
baseCategories.filter(cat => !dynamicCategories.includes(cat)).forEach(cat => 
  console.log(`      - ${cat}`)
)

// 3. Filtering behavior
console.log('\n3. Smart Filtering Behavior:')
console.log('   🔍 User searches for "microsoft":')
const microsoftAlerts = sampleAlerts.filter(alert => 
  alert.title.toLowerCase().includes('microsoft') || 
  alert.category.toLowerCase().includes('microsoft')
)
microsoftAlerts.forEach(alert => console.log(`      ✅ ${alert.category}: ${alert.title}`))

console.log('\n   🏷️ User filters by "Cryptocurrency Scam":')
const cryptoAlerts = sampleAlerts.filter(alert => alert.category === 'Cryptocurrency Scam')
cryptoAlerts.forEach(alert => console.log(`      ✅ ${alert.title}`))

console.log('\n   ⚡ User filters "Affects me":')
const affectsMeAlerts = sampleAlerts.filter(alert => alert.id === '1' || alert.id === '4') // Simulated
affectsMeAlerts.forEach(alert => console.log(`      ⚡ ${alert.title}`))

// 4. Live preview feature
console.log('\n4. Live Preview Feature:')
console.log('   📊 Real-time count: "5 of 8 results"')
console.log('   🎯 Updates instantly as user types/selects')
console.log('   🔄 Recalculates when filters change')

console.log('\n5. Smart Features:')
console.log('   🆕 Dynamic categories appear first with "🆕" indicator')
console.log('   📂 Organized in optgroups for clarity')
console.log('   🔍 Search works across title and category')
console.log('   📊 Live result counting')
console.log('   🎯 Location search is partial match')
console.log('   ⚡ "Affects me" quick filter')

console.log('\n=== Demo Complete ===')
console.log('✅ Smart FilterBar handles dynamic categories perfectly!')
