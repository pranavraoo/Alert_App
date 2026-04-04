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


export async function queryWithOllama(prompt: string, mode: 'narrative' | 'report' = 'narrative'): Promise<{ summary: string }> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL ?? 'llama3.1:8b'

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



