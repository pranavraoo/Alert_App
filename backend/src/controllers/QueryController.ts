import { Request, Response } from 'express'
import { queryWithAI } from '../lib/ai/index.js'
import { z } from 'zod'

export class QueryController {
  async handleQuery(req: Request, res: Response) {
    try {
      const schema = z.object({
        question: z.string().min(1),
      })

      const parsed = schema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: parsed.error.errors 
        })
      }

      const { question } = parsed.data
      const normalizedQuestion = question.toLowerCase()

      // Get database connection
      const { prisma } = await import('../lib/db.js')

      // Get alerts that match user preferences (same logic as AlertService)
      const userPrefs = await prisma.userPreference.findFirst({
        where: { id: 'default' }
      })
      const userConcerns = userPrefs?.concerns || []
      const userSeverities = userPrefs?.severities || []

      // Build where clause based on user concerns
      const where: any = {}
      
      if (userConcerns.length > 0) {
        // Apply same filtering logic as AlertService
        const categoryMapping: Record<string, string[]> = {
          'CVE': ['CVE', 'Vulnerability', 'Critical'],
          'Phishing': ['Phishing', 'Scam'],
          'Local Safety': ['Local Safety', 'Community'],
          'Microsoft Account Imposter': ['Microsoft', 'Account', 'Imposter']
        }

        const matchingCategories: string[] = []
        for (const [category, keywords] of Object.entries(categoryMapping)) {
          if (keywords.some(keyword => userConcerns.includes(keyword))) {
            matchingCategories.push(category)
          }
        }

        if (matchingCategories.length > 0) {
          where.category = { in: matchingCategories }
        }
      }

      if (userSeverities.length > 0) {
        // Apply severity preferences
        where.severity = { in: userSeverities }
      }

      // Get only alerts that match user preferences
      const allAlerts = await prisma.alert.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: 50 // Limit to recent 50 for better context
      })

      console.log(`Found ${allAlerts.length} alerts for query processing`)
      if (allAlerts.length > 0) {
        console.log('Sample alerts:', allAlerts.slice(0, 3).map(a => `${a.title} (${a.category})`))
        console.log('First alert structure:', JSON.stringify(allAlerts[0], null, 2))
      }

      // Try AI first, fallback to smart matching
      let answer: string
      let referencedAlerts: any[] = []

      try {
        // Use AI to understand and answer the question
        const aiResponse = await this.queryWithAI(normalizedQuestion, allAlerts)
        
        // Check if AI returned a fallback message
        if (aiResponse.answer.includes('rate limits') || aiResponse.answer.includes('temporarily unavailable')) {
          console.warn('AI unavailable due to rate limits, using smart matching')
          const smartResponse = this.queryWithSmartMatching(normalizedQuestion, allAlerts)
          answer = smartResponse.answer
          referencedAlerts = smartResponse.referencedAlerts || []
        } else {
          answer = aiResponse.answer
          referencedAlerts = aiResponse.referencedAlerts || []
          console.log('✅ AI query successful')
        }
      } catch (error) {
        console.warn('AI query failed, using smart matching:', error)
        const smartResponse = this.queryWithSmartMatching(normalizedQuestion, allAlerts)
        console.log('Smart matching result:', smartResponse)
        answer = smartResponse.answer
        referencedAlerts = smartResponse.referencedAlerts || []
      }

      res.json({ answer, referencedAlerts })
    } catch (error) {
      console.error('Query error:', error)
      res.status(500).json({ error: 'Query processing failed' })
    }
  }

  private async queryWithAI(question: string, alerts: any[]): Promise<{answer: string, referencedAlerts: any[]}> {
    // Use AI to understand the question and generate an answer
    const context = alerts.slice(0, 10).map((alert, index) => 
      `[${index}] ${alert.title} (${alert.category}, ${alert.severity}): ${alert.description.substring(0, 100)}...`
    ).join('\n')

    const prompt = `You are a helpful security assistant. Based on the following security alerts, answer the user's question and reference the specific alerts you used.

Recent Security Alerts:
${context}

User Question: ${question}

Provide a helpful, concise answer based on the available alerts. If no relevant alerts are found, say so politely. Keep the answer under 150 words.

IMPORTANT: At the end of your answer, include the alert numbers you referenced in this format: [References: 0, 2, 4]`

    const result = await queryWithAI(prompt)
    
    // Extract alert references from the response
    const referenceMatch = result.summary?.match(/\[References: ([\d,\s]+)\]/)
    const referencedIndexes = referenceMatch ? referenceMatch[1].split(',').map((i: string) => parseInt(i.trim())) : []
    const referencedAlerts = referencedIndexes.map(index => alerts[index]).filter(Boolean)
    
    // Clean the answer to remove the references part
    const cleanAnswer = result.summary?.replace(/\[References: [\d,\s]+\]/, '').trim() || 
      `I found ${alerts.length} recent alerts. Based on your question "${question}", here's what I can tell you: ${result.summary}`
    
    return { 
      answer: cleanAnswer, 
      referencedAlerts 
    }
  }

  private queryWithSmartMatching(question: string, alerts: any[]): {answer: string, referencedAlerts: any[]} {
    const normalizedQuestion = question.toLowerCase()
    let answer = ''
    let referencedAlerts: any[] = []
    
    // Smart keyword matching for different query types
    if (normalizedQuestion.includes('phishing') || normalizedQuestion.includes('scam')) {
      const phishingAlerts = alerts.filter(alert => 
        alert.category.toLowerCase().includes('phishing') || 
        alert.category.toLowerCase().includes('scam') ||
        alert.category.toLowerCase().includes('imposter') ||
        alert.title.toLowerCase().includes('phishing') ||
        alert.title.toLowerCase().includes('suspicious') ||
        alert.description.toLowerCase().includes('phishing') ||
        alert.description.toLowerCase().includes('verify') ||
        alert.description.toLowerCase().includes('suspicious')
      )
      
      if (phishingAlerts.length > 0) {
        answer = `Found ${phishingAlerts.length} phishing/scam alerts. Recent ones include: ${phishingAlerts.slice(0, 3).map(a => a.title).join(', ')}. Be cautious of urgent requests for personal information or account verification.`
        referencedAlerts = phishingAlerts.slice(0, 3)
      }
    }

    if (normalizedQuestion.includes('cve') || normalizedQuestion.includes('vulnerability')) {
      const cveAlerts = alerts.filter(alert => 
        alert.category.toLowerCase().includes('cve') || 
        alert.category.toLowerCase().includes('vulnerability')
      )
      
      if (cveAlerts.length > 0) {
        answer = `Found ${cveAlerts.length} vulnerability alerts. Recent ones: ${cveAlerts.slice(0, 3).map(a => a.title).join(', ')}. Consider applying security updates promptly.`
        referencedAlerts = cveAlerts.slice(0, 3)
      }
    }

    if (normalizedQuestion.includes('critical') || normalizedQuestion.includes('high severity')) {
      const criticalAlerts = alerts.filter(alert => 
        alert.severity === 'critical' || alert.severity === 'high'
      )
      
      if (criticalAlerts.length > 0) {
        answer = `Found ${criticalAlerts.length} critical/high severity alerts requiring immediate attention: ${criticalAlerts.slice(0, 3).map(a => a.title).join(', ')}.`
        referencedAlerts = criticalAlerts.slice(0, 3)
      }
    }

    if (normalizedQuestion.includes('data breach') || normalizedQuestion.includes('breach')) {
      const breachAlerts = alerts.filter(alert => 
        alert.category.toLowerCase().includes('data breach') ||
        alert.description.toLowerCase().includes('breach')
      )
      
      if (breachAlerts.length > 0) {
        answer = `Found ${breachAlerts.length} data breach related alerts: ${breachAlerts.slice(0, 3).map(a => a.title).join(', ')}. Monitor your accounts for suspicious activity.`
        referencedAlerts = breachAlerts.slice(0, 3)
      }
    }

    if (normalizedQuestion.includes('local') || normalizedQuestion.includes('nearby') || normalizedQuestion.includes('area')) {
      const localAlerts = alerts.filter(alert => 
        alert.category.toLowerCase().includes('local') ||
        alert.description.toLowerCase().includes('local')
      )
      
      if (localAlerts.length > 0) {
        answer = `Found ${localAlerts.length} local safety alerts: ${localAlerts.slice(0, 3).map(a => a.title).join(', ')}. Stay aware of your surroundings.`
        referencedAlerts = localAlerts.slice(0, 3)
      }
    }

    // Default response
    if (!answer) {
      const activeCount = alerts.filter(a => !a.resolved).length
      answer = `I found ${alerts.length} total alerts (${activeCount} active). For specific information about phishing, vulnerabilities, data breaches, or local threats, please ask more specifically. Recent alerts include: ${alerts.slice(0, 3).map(a => a.title).join(', ')}.`
      referencedAlerts = alerts.slice(0, 3)
    }

    return { answer, referencedAlerts }
  }
}
