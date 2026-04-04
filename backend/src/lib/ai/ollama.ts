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
    'Categories: Scam, Phishing, Imposter, Data breach, Local safety, CVE, Other',
    'Severities: low, medium, high, critical',
    'Create a catchy, concise title under 50 characters that captures the threat essence.',
    'Summarize actionable threat context in human-centric, calm language under 120 characters.',
    'Return exactly this JSON shape:',
    '{ "title": "Catchy title under 50 chars", "category": "One of: Scam, Phishing, Imposter, Data breach, Local safety, CVE, Other", "severity": "...", "summary": "Human-centric summary under 120 chars", "suggested_action": "1-2 concrete steps.", "reason": "Brief explanation under 80 chars.", "confidence": "high" }',
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


export async function queryWithOllama(prompt: string): Promise<{ summary: string }> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL ?? 'llama3.1:8b'

  const system = [
    'You are a Senior Security Analyst at Community Guardian (a local-government safety platform).',
    'Provide professional, authoritative, yet reassuring information based on the alerts provided.',
    'Formatting Guidelines:',
    '- PRIMARY MISSION: Your absolute top priority is to answer the "TARGET QUERY" concisely and accurately. Use the RAW SECURITY DATA to mine for answers, but IGNORE unrelated alerts if the user is asking about a specific topic (e.g., Apple ID).',
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

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ]
    })
  })

  if (!response.ok) {
    throw new Error(`Ollama API returned ${response.status}`)
  }

  const data = (await response.json()) as OllamaChatResponse
  return { summary: data.message?.content?.trim() || 'No response generated' }
}



