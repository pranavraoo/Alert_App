import type { AICategorizationResult } from '../../types/alert.js'
import { categorizeWithGemini } from './gemini.js'
import { categorizeWithOllama } from './ollama.js'

export async function categorizeText(text: string): Promise<AICategorizationResult> {
  const provider = (process.env.AI_PROVIDER ?? 'gemini').toLowerCase()
  if (provider === 'ollama') return await categorizeWithOllama(text)
  return await categorizeWithGemini(text)
}

