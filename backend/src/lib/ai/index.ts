import type { AICategorizationResult } from '../../types/alert.js'
import { categorizeWithGemini, queryWithGemini } from './gemini.js'
import { categorizeWithOllama, queryWithOllama } from './ollama.js'
import { fallbackCategorize } from '../fallback.js'

export async function categorizeText(text: string): Promise<AICategorizationResult> {
  const provider = (process.env.AI_PROVIDER ?? 'gemini').toLowerCase()
  
  try {
    if (provider === 'ollama') {
      return await categorizeWithOllama(text)
    }
    return await categorizeWithGemini(text)
  } catch (error) {
    console.warn('AI provider failed, using fallback:', error)
    // Use our enhanced fallback system when AI is unavailable
    return fallbackCategorize(text)
  }
}

export async function queryWithAI(prompt: string): Promise<{summary: string}> {
  const provider = (process.env.AI_PROVIDER ?? 'gemini').toLowerCase()
  
  try {
    if (provider === 'ollama') {
      return await queryWithOllama(prompt)
    }
    return await queryWithGemini(prompt)
  } catch (error) {
    console.warn('AI query failed, using fallback:', error)
    // Instead of generic message, throw error to let QueryController handle smart matching
    throw new Error(`AI provider failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}