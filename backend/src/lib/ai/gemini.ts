import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AICategorizationResult } from '../../types/alert'

export async function categorizeWithGemini(text: string): Promise<AICategorizationResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY')

  const modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'

  const system = [
    'You are a cybersecurity expert specializing in scam detection and user safety.',
    'Return ONLY valid JSON (no markdown, no commentary).',
    'Categories: Scam, Phishing, Imposter, Data breach, Local safety, CVE, Other',
    'Severities: low, medium, high, critical',
    'Create a catchy, concise title under 50 characters that captures the threat essence.',
    'Summarize actionable threat context in human-centric, calm language under 120 characters.',
    'Return exactly this JSON shape:',
    '{ "title": "Catchy title under 50 chars", "category": "One of: Scam, Phishing, Imposter, Data breach, Local safety, CVE, Other" , "severity": "...", "summary": "Human-centric summary under 120 chars", "suggested_action": "1-2 concrete steps.", "reason": "Brief explanation under 80 chars.", "confidence": "high" }',
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
  return JSON.parse(content) as AICategorizationResult
}

export async function queryWithGemini(prompt: string): Promise<{ summary: string }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  const system = [
    'You are a Senior Security Analyst at Community Guardian (a local-government safety platform).',
    'Provide professional, authoritative, yet reassuring information based on the alerts provided.',
    'Formatting Guidelines:',
    '- PRIMARY MISSION: Answer the "User Question" accurately and conversationally. Speak to the user as a helpful neighbor, not a technical report.',
    '- DO NOT use scientific, academic, or overly technical jargon. Speak like a helpful neighbor.',
    '- CRITICAL: DO NOT mention alert titles, categories (e.g., "Local safety"), or severities (e.g., "medium") in your text. Focus on what is actually happening.',
    '- CRITICAL: DO NOT use alert numbers or indices in your visible response (e.g., remove "alert [5]" or "[5]").',
    '- Start directly with a rich, detailed professional overview (at least 3-4 sentences) that precisely addresses the keywords in the user\'s TARGET QUERY.',
    '- Use "### ⚠️ Security Impact" for the impact section. Provide a comprehensive, multi-point synthesized assessment (at least 3-4 bullet points) of the specific risks related to the user\'s query.',
    '- Use "### ✅ Recommended Actions" for the action plan. Provide a list of concise, actionable steps relating to the core query topic.',
    '- IMPORTANT: Always use "*" followed by a space for each bullet point.',
    '- IMPORTANT: Always put TWO blank lines between EVERY section, header, and list to ensure correct markdown parsing.',
    '- Ensure each bullet point is on its own separate line.',
    '- Keep the total response under 350 words.',
  ].join('\n')

  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    systemInstruction: system,
  })

  const result = await model.generateContent(prompt)
  let content = result.response.text()

  // Clean up any extra whitespace
  content = content.trim()

  return { summary: content }
}
