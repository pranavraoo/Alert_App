// Simple test to verify categorization works
import { categorizeText } from '../src/lib/ai/index.js'

async function testCategorization() {
  try {
    console.log('Testing categorization...')
    
    const testText = "Urgent: Your Microsoft account will be suspended! Click here now!"
    console.log('Input:', testText)
    
    const result = await categorizeText(testText)
    console.log('Result:', JSON.stringify(result, null, 2))
    
    console.log('✅ Categorization working!')
  } catch (error) {
    console.error('❌ Categorization failed:', error)
  }
}

testCategorization()
