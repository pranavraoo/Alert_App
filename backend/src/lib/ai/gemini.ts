import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AICategorizationResult } from '../../types/alert.ts'

export async function categorizeWithGemini(text: string): Promise<AICategorizationResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

  const modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'

  const system = [
    'You are a cybersecurity expert specializing in scam detection and user safety.',
    'Return ONLY valid JSON (no markdown, no commentary).',
    'Generate a dynamic, highly relevant 1-3 word category (e.g., "Cryptocurrency Scam", "Malware Delivery", "Identity Theft").',
    'Severities: low, medium, high, critical',
    'Create a catchy, concise title under 50 characters that captures the threat essence.',
    'Summarize actionable threat context in human-centric, calm language under 120 characters.',
    'Return exactly this JSON shape:',
    '{ "title": "Catchy title under 50 chars", "category": "Dynamic category", "severity": "...", "summary": "Human-centric summary under 120 chars", "suggested_action": "1-2 concrete steps.", "reason": "Brief explanation under 80 chars.", "confidence": "high" }',
  ].join('\n')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: system,
  })

  const result = await model.generateContent(text)
  let content = result.response.text()
  console.log('Gemini raw response:', content)
  
  // Remove markdown code blocks if present
  if (content.includes('```json')) {
    content = content.replace(/```json\s*/, '').replace(/```\s*$/, '')
  } else if (content.includes('```')) {
    content = content.replace(/```\s*/, '').replace(/```\s*$/, '')
  }
  
  // Clean up any extra whitespace
  content = content.trim()
  
  try {
    return JSON.parse(content) as AICategorizationResult
  } catch (error) {
    console.error('Failed to parse Gemini response as JSON:', content)
    throw new Error(`Invalid JSON response from Gemini: ${content}`)
  }
}

