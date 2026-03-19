// Test the fallback categorizer directly
import { fallbackCategorize } from '../src/lib/fallback.js'

async function testFallback() {
  try {
    console.log('Testing fallback categorizer...')
    
    const testText = "Urgent: Your Microsoft account will be suspended! Click here now!"
    console.log('Input:', testText)
    
    const result = fallbackCategorize(testText)
    console.log('Result:', JSON.stringify(result, null, 2))
    
    console.log('✅ Fallback categorizer working!')
  } catch (error) {
    console.error('❌ Fallback failed:', error)
  }
}

testFallback()
