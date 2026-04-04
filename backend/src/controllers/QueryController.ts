import { Request, Response } from 'express'
import { queryWithAI } from '../lib/ai/index.js'
import { SmartCategoryMatcher } from '../lib/smartCategoryMatcher.js'
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
        // Use smart category matching (same as AlertService)
        const matchedCategories = SmartCategoryMatcher.matchConcernsToCategories(userConcerns)
        
        if (matchedCategories.length > 0) {
          where.category = { in: matchedCategories }
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
    const normalizedQuestion = question.toLowerCase()
    
    // 1. Extract keywords from the question for relevance boosting
    // Simple noun/topic extraction (words > 3 chars, removing common stop words)
    const stopWords = new Set(['what', 'where', 'when', 'how', 'many', 'tell', 'show', 'please', 'about', 'with', 'there', 'some', 'this', 'that'])
    const keywords = normalizedQuestion.split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w))
    
    // 2. Score and sort alerts by relevance to the specific question
    const scoredAlerts = alerts.map(alert => {
      let score = 0
      const title = alert.title.toLowerCase()
      const desc = alert.description.toLowerCase()
      const cat = alert.category.toLowerCase()
      
      keywords.forEach(kw => {
        if (title.includes(kw)) score += 10
        if (cat.includes(kw)) score += 5
        if (desc.includes(kw)) score += 2
      })
      
      return { ...alert, relevanceScore: score }
    }).sort((a, b) => b.relevanceScore - a.relevanceScore || b.created_at.getTime() - a.created_at.getTime())

    // 3. Use top 15 most relevant alerts for context
    const contextAlerts = scoredAlerts.slice(0, 15)
    
    const context = contextAlerts.map((alert, index) => 
      `[${index}] ${alert.title} (${alert.category}): ${alert.description.substring(0, 150)}...`
    ).join('\n')

    const prompt = `TARGET QUERY: ${question}
(This is your primary mission. Provide a detailed, conversational answer focused on this specific user intent.)

RAW SECURITY DATA:
${context}`

    const result = await queryWithAI(prompt)
    
    const summary = result.summary || ''
    
    // Extract all alert references from the response (globally in case AI included multiple)
    const referenceRegex = /\[References: ([\d,\s]+)\]/g
    const matches = Array.from(summary.matchAll(referenceRegex))
    const referencedIndexes = Array.from(new Set(
      matches.flatMap(match => match[1].split(',').map((i: string) => parseInt(i.trim())))
    ))
    const referencedAlerts = referencedIndexes.map(index => contextAlerts[index]).filter(Boolean)
    
    // 2. Clear all reference markers from the visible text for a cleaner UI
    // This regex targets the entire line/tag regardless of terminal spacing
    const cleanAnswer = result.summary
      .replace(/\s*\[References: [\d, ]+\]\s*$/g, '') // remove from end with any whitespace
      .replace(/\[References: [\d, ]+\]/g, '')         // final safety check for any remaining tags
      .trim() || 
      `I found ${alerts.length} recent alerts. Based on your intent, here's what I can tell you: ${result.summary}`
    
    return { 
      answer: cleanAnswer, 
      referencedAlerts 
    }
  }

  private queryWithSmartMatching(question: string, alerts: any[]): {answer: string, referencedAlerts: any[]} {
    const normalizedQuestion = question.toLowerCase()
    let answer = ''
    let referencedAlerts: any[] = []
    
    // Calculate stats used in multiple blocks
    const activeCount = alerts.filter(a => !a.resolved).length
    const categoryCounts = alerts.reduce((acc: Record<string, number>, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1
      return acc
    }, {})
    
    // Smart keyword matching for different query types
    if (normalizedQuestion.includes('phishing') || normalizedQuestion.includes('scam') || normalizedQuestion.includes('fraud')) {
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
        answer = `I've found **${phishingAlerts.length}** alerts related to phishing or scams. These often involve suspicious links or requests for verification.

**Recent highlights:**
${phishingAlerts.slice(0, 3).map(a => `• ${a.title}`).join('\n')}

Please be extremely cautious with any unexpected emails or messages asking for personal data.`
        referencedAlerts = phishingAlerts.slice(0, 3)
      }
    }

    if (normalizedQuestion.includes('cve') || normalizedQuestion.includes('vulnerability') || normalizedQuestion.includes('software') || normalizedQuestion.includes('patch')) {
      const cveAlerts = alerts.filter(alert => 
        alert.category.toLowerCase().includes('cve') || 
        alert.category.toLowerCase().includes('vulnerability')
      )
      
      if (cveAlerts.length > 0) {
        answer = `I've detected **${cveAlerts.length}** vulnerability alerts (CVEs). Keeping your software updated is the best defense against these.

**Key alerts to check:**
${cveAlerts.slice(0, 3).map(a => `• ${a.title}`).join('\n')}

Make sure to apply any pending security updates on your devices soon.`
        referencedAlerts = cveAlerts.slice(0, 3)
      }
    }

    if (normalizedQuestion.includes('critical') || normalizedQuestion.includes('high severity') || normalizedQuestion.includes('urgent')) {
      const criticalAlerts = alerts.filter(alert => 
        alert.severity === 'critical' || alert.severity === 'high'
      )
      
      if (criticalAlerts.length > 0) {
        answer = `I've found **${criticalAlerts.length}** critical or high-severity alerts that require your immediate attention.

**Important issues:**
${criticalAlerts.slice(0, 3).map(a => `• ${a.title}`).join('\n')}

I recommend reviewing these as soon as possible to ensure your safety.`
        referencedAlerts = criticalAlerts.slice(0, 3)
      }
    }

    if (normalizedQuestion.includes('data breach') || normalizedQuestion.includes('breach') || normalizedQuestion.includes('exposed')) {
      const breachAlerts = alerts.filter(alert => 
        alert.category.toLowerCase().includes('data breach') ||
        alert.description.toLowerCase().includes('breach') ||
        alert.description.toLowerCase().includes('exposed')
      )
      
      if (breachAlerts.length > 0) {
        answer = `There are **${breachAlerts.length}** alerts concerning data breaches or exposed information. 

**Recent reports:**
${breachAlerts.slice(0, 3).map(a => `• ${a.title}`).join('\n')}

It's a good idea to monitor your online accounts and consider changing important passwords.`
        referencedAlerts = breachAlerts.slice(0, 3)
      }
    }

    if (normalizedQuestion.includes('local') || normalizedQuestion.includes('nearby') || normalizedQuestion.includes('area') || normalizedQuestion.includes('neighborhood')) {
      const localAlerts = alerts.filter(alert => 
        alert.category.toLowerCase().includes('local') ||
        alert.description.toLowerCase().includes('local')
      )
      
      if (localAlerts.length > 0) {
        answer = `I've found **${localAlerts.length}** safety alerts for your general area.

**Local incidents:**
${localAlerts.slice(0, 3).map(a => `• ${a.title}`).join('\n')}

Stay aware of your surroundings and check for updates from local authorities.`
        referencedAlerts = localAlerts.slice(0, 3)
      }
    }

    // Count-based queries
    if (normalizedQuestion.includes('count') || 
        normalizedQuestion.includes('how many') || 
        normalizedQuestion.includes('total') || 
        normalizedQuestion.includes('breakdown') ||
        normalizedQuestion.includes('summary')) {
      answer = `I analyzed **${alerts.length}** total alerts, with **${activeCount}** still requiring attention.

**Current Breakdown:**
${Object.entries(categoryCounts).map(([cat, count]) => `• ${cat}: ${count}`).join('\n')}

Is there a specific threat or category you'd like me to look into?`
      referencedAlerts = alerts.slice(0, 3)
    }

    // Recent/active queries
    if (normalizedQuestion.includes('recent') || normalizedQuestion.includes('latest') || normalizedQuestion.includes('new')) {
      const recentAlerts = alerts.slice(0, 5)
      answer = `Here are the **latest ${recentAlerts.length} alerts** that have been reported:

${recentAlerts.map(a => `• ${a.title}`).join('\n')}

Staying informed about these emerging threats is your best protection.`
      referencedAlerts = recentAlerts
    }

    // Default response
    if (!answer) {
      answer = `I can help you stay informed by analyzing the **${alerts.length}** alerts in our system (including **${activeCount}** unresolved ones).

**Common threats to ask about:**
• Phishing and scams
• Software vulnerabilities (CVEs)
• Data breaches
• Local safety incidents

Try asking: *"What are the most recent phishing scams?"* or *"Are there any critical alerts?"*`
      referencedAlerts = alerts.slice(0, 3)
    }

    return { answer, referencedAlerts }
  }
}
