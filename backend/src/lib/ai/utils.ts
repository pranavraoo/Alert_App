/**
 * AI Utility Helpers
 */

/**
 * Fetches with a mandatory timeout to prevent hanging the backend on slow AI responses.
 */
export async function fetchWithTimeout(url: string, options: any, timeoutMs = 15000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error: any) {
    clearTimeout(id)
    if (error.name === 'AbortError') {
      throw new Error(`AI request timed out after ${timeoutMs}ms`)
    }
    throw error
  }
}

/**
 * Extracts JSON from a string that might contain markdown blocks or leading/trailing text.
 */
export function extractJSON<T>(content: string): T {
  try {
    // 1. Direct parse attempt
    return JSON.parse(content.trim())
  } catch {
    // 2. Try to find content between { and }
    const jsonMatch = content.match(/(\{[\s\S]*\})/i)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim())
      } catch (e) {
        console.error('Failed to parse matched JSON block:', e)
      }
    }
    
    // 3. Fallback: cleaning specific common hallucinations
    const cleaned = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()
    
    try {
      return JSON.parse(cleaned)
    } catch (e) {
      throw new Error(`Failed to extract valid JSON from AI response: ${content.substring(0, 50)}...`)
    }
  }
}
