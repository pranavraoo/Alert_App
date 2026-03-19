import type { AICategorizationResult } from '../../types/alert.js'
import { categorizeWithGemini } from './gemini.js'
import { categorizeWithOllama } from './ollama.js'
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

async function queryWithGemini(prompt: string): Promise<{summary: string}> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-pro',
    systemInstruction: `You are a helpful security assistant. Answer user questions based on the provided security alerts. Be concise and helpful. Keep answers under 150 words.`
  })

  const result = await model.generateContent(prompt)
  let content = result.response.text()
  
  // Clean up any extra whitespace
  content = content.trim()

  return { summary: content }
}

async function queryWithOllama(prompt: string): Promise<{summary: string}> {
  if (!process.env.OLLAMA_BASE_URL) {
    throw new Error('OLLAMA_BASE_URL is not set')
  }

  const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL || 'llama2',
      prompt: `You are a helpful security assistant. Answer user questions based on the provided security alerts. Be concise and helpful. Keep answers under 150 words.\n\n${prompt}`,
      stream: false
    })
  })

  if (!response.ok) {
    throw new Error(`Ollama API returned ${response.status}`)
  }

  const data = await response.json()
  return { summary: data.response?.trim() || 'No response generated' }
}

