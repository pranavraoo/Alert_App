import { Request, Response } from 'express'
import { categorizeText } from '../lib/ai/index.js'
import { fallbackCategorize } from '../lib/fallback.js'
import { z } from 'zod'

export class CategorizeController {
  async categorize(req: Request, res: Response) {
    try {
      const schema = z.object({ text: z.string().min(1) })
      const parsed = schema.safeParse(req.body)
      
      if (!parsed.success) {
        return res.status(400).json({ error: 'Missing text' })
      }

      try {
        const ai = await categorizeText(parsed.data.text)
        return res.json({ ...ai, used_fallback: false })
      } catch {
        const fb = fallbackCategorize(parsed.data.text)
        return res.json({ ...fb, used_fallback: true })
      }
    } catch (error) {
      console.error('Error categorizing text:', error)
      res.status(500).json({ error: 'Failed to categorize text' })
    }
  }
}
