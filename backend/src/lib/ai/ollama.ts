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
    'Categories: Scam, Phishing, Imposter, Data breach, Local safety, CVE, Other',
    'Severities: low, medium, high, critical',
    'Return exactly this JSON shape:',
    '{ "category": "...", "severity": "...", "summary": "...", "suggested_action": "...", "reason": "...", "confidence": "high" }',
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

