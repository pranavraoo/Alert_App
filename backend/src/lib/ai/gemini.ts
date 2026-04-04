import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AICategorizationResult } from '../../types/alert'
import { extractJSON } from './utils.js'

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
  const content = result.response.text()
  console.log('Gemini raw response:', content)

  return extractJSON<AICategorizationResult>(content)
}

export async function queryWithGemini(prompt: string, mode: 'narrative' | 'report' = 'narrative'): Promise<{ summary: string }> {
  const NARRATIVE_SYSTEM = [
    'You are a Professional Security Consultant at Community Guardian.',
    'Formulating a conversational human-friendly response to "TARGET QUERY".',
    'Tone: Encouraging, non-academic, and helpful neighbor (not a robot).',
    'Formatting Guidelines:',
    '- Provide 3-4 structured, skimmable paragraphs.',
    '- ALWAYS put TWO blank lines between every paragraph to ensure clear visual separation.',
    '- You MAY use bold (**text**) to highlight critical sentences or key findings.',
    '- DO NOT use Markdown headers (like "#" or "###").',
    '- CRITICAL: If the "RAW SECURITY DATA" contains the notice "[!] NO DIRECTLY RELEVANT ALERTS", explicitly state that you found no community reports for the user\'s specific topic before giving general advice.',
    '- Paragraph 1: Start with a direct, conversational answer to the question.',
    '- Paragraph 2: Incorporate relevant details from the provided community alerts.',
    '- Paragraph 3: Offer reassurance and clear next steps for the user.',
    '- DO NOT use alert numbers or indices in your visible response.',
    '- MANDATORY: Wrap your entire response (all paragraphs) inside <narrative> tags.',
  ].join('\n')

  const REPORT_SYSTEM = [
    'You are a Professional Security Reporting Engine.',
    'Providing direct, objective safety reports based on community data.',
    'Formatting Guidelines:',
    '- PRIMARY MISSION: Provide a three-part safety analysis for the "TARGET QUERY":',
    '- CRITICAL: START your response IMMEDIATELY with the conversational overview.',
    '- DO NOT use any introductory phrases like "As a...", "At Community Guardian...", or "We take this seriously...".',
    '- First: Start with the conversational security overview (4-5 sentences).',
    '- Next: Add the mandatory header "### ⚠️ Security Impact" followed by 3-4 bullet points.',
    '- Finally: Add the mandatory header "### ✅ Recommended Actions" followed by 3-4 bullet points.',
    '- STRICT CONSTRAINT: DO NOT output any meta-labels like "Part", "Overview", or "Analysis" in your response.',
    '- IMPORTANT: Use only the exact headers "### ⚠️ Security Impact" and "### ✅ Recommended Actions".',
    '- IMPORTANT: Use "*" for each bullet point. DO NOT use "-" or other markers.',
    '- CRITICAL: If the "RAW SECURITY DATA" contains the notice "[!] NO DIRECTLY RELEVANT ALERTS", explicitly state that you found no community reports for the user\'s specific topic before giving specific advice.',
    '- DO NOT use scientific, academic, or overly technical jargon.',
    '- CRITICAL: DO NOT use alert numbers or indices in your visible response (e.g., remove "alert [5]" or "[5]").',
    '- ALWAYS put TWO blank lines between every header and every list.',
    '- MANDATORY: Wrap your entire response (overview, headers, and bullets) inside <security_report> tags.',
  ].join('\n')

  const system = mode === 'report' ? REPORT_SYSTEM : NARRATIVE_SYSTEM

  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
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
