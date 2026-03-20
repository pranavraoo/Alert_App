import type { AICategorizationResult } from '../../types/alert.ts'

type OllamaChatResponse = {
  message?: { content?: string }
}

export async function categorizeWithOllama(text: string): Promise<AICategorizationResult> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL ?? 'llama3.1:8b'

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

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: text },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`)

  const data = (await res.json()) as OllamaChatResponse
  const content = data.message?.content
  if (!content) throw new Error('Ollama returned empty content')
  
  console.log('Ollama raw content:', content)
  
  const result = JSON.parse(content) as AICategorizationResult
  return result
 
}


export async function queryWithOllama(prompt: string): Promise<{summary: string}> {
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



