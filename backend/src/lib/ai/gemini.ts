import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AICategorizationResult } from '../../types/alert.js'

export async function categorizeWithGemini(text: string): Promise<AICategorizationResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

  const modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'

  const system = [
    'You are a calm, factual safety assistant.',
    'Return ONLY valid JSON (no markdown, no commentary).',
    'Categorize the text into exactly ONE of the following:',
    '- Infrastructure (physical damage, potholes, broken lights)',
    '- Safety (physical threats, emergencies, health risks)',
    '- Noise (loud parties, construction, dogs barking)',
    '- Suspicious Activity (scams, digital phishing, prowlers, unauthorized persons)',
    '- Other (anything else)',
    'Severities: low, medium, high, critical',
    'Return exactly this JSON shape:',
    '{ "category": "...", "severity": "...", "summary": "One calm sentence under 120 chars.", "suggested_action": "1-2 concrete steps.", "reason": "Brief explanation under 80 chars.", "confidence": "high" }',
  ].join('\n')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: system,
  })

  const result = await model.generateContent(text)
  let content = result.response.text().trim()
  
  if (content.startsWith('```json')) {
    content = content.slice(7)
  } else if (content.startsWith('```')) {
    content = content.slice(3)
  }
  if (content.endsWith('```')) {
    content = content.slice(0, -3)
  }
  
  return JSON.parse(content.trim()) as AICategorizationResult
}

