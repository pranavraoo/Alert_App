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
  
  try {
    const result = JSON.parse(content) as AICategorizationResult
    
    // SECURITY VALIDATION: Never allow dangerous financial advice
    if (result.suggested_action) {
      const dangerousActions = [
        'send', 'transfer', 'pay', 'wire', 'payment', 'money', 'funds'
      ]
      
      const hasDangerousAction = dangerousActions.some(action => 
        result.suggested_action.toLowerCase().includes(action)
      )
      
      if (hasDangerousAction) {
        console.error('🚨 DANGEROUS AI ADVICE DETECTED:', result.suggested_action)
        
        // Override with safe advice
        result.suggested_action = 'DO NOT send money. Contact bank directly through official channels. Verify identity independently.'
        result.reason = 'AI detected dangerous financial advice - this appears to be a scam requesting money transfers.'
        result.confidence = 'high'
      }
    }
    
    console.log('Final AI result:', result)
    return result
  } catch (error) {
    console.error('Failed to parse Ollama response:', content)
    
    // Fallback: Try to extract JSON from natural language response
    try {
      // Look for JSON-like patterns in the response
      const jsonMatch = content.match(/\{[^}]+\}/)
      if (jsonMatch) {
        const extractedJson = JSON.parse(jsonMatch[0]) as AICategorizationResult
        console.log('Extracted JSON from natural language:', extractedJson)
        return extractedJson
      }
    } catch (extractError) {
      console.error('Failed to extract JSON:', extractError)
    }
    
    // Final fallback: Return a default categorization
    const fallbackResult: AICategorizationResult = {
      title: "Potential Scam - Review Required",
      category: "Other",
      severity: "high",
      summary: "Message requests money or financial action - requires manual verification",
      suggested_action: "DO NOT send money. Contact through official channels only. Verify independently.",
      reason: "AI detected potential scam requesting money transfers",
      confidence: "high"
    }
    
    console.log('Using fallback categorization:', fallbackResult)
    return fallbackResult
  }
}

