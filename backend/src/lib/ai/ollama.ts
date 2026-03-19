import type { AICategorizationResult } from '../../types/alert.js'

type OllamaChatResponse = {
  message?: { content?: string }
}

export async function categorizeWithOllama(text: string): Promise<AICategorizationResult> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL ?? 'llama3.1:8b'

  const system = [
    'You are a calm, factual safety assistant.',
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

  return JSON.parse(content) as AICategorizationResult
}

