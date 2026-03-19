import { Request, Response } from 'express'
import { PreferencesService } from '../services/PreferencesService.js'
import { z } from 'zod'

export class PreferencesController {
  private preferencesService: PreferencesService

  constructor() {
    this.preferencesService = new PreferencesService()
  }

  async getPreferences(req: Request, res: Response) {
    try {
      const preferences = await this.preferencesService.getPreferences()
      res.json(preferences)
    } catch (error) {
      console.error('Error fetching preferences:', error)
      res.status(500).json({ error: 'Failed to fetch preferences' })
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const updateSchema = z.object({
        concerns: z.array(z.string()).optional(),
        severities: z.array(z.string()).optional(),
        theme: z.enum(['light', 'dark', 'system']).optional(),
        quiet_start: z.string().optional(),
        quiet_end: z.string().optional(),
      })

      const validatedData = updateSchema.parse(req.body)
      const preferences = await this.preferencesService.updatePreferences(validatedData)
      
      res.json(preferences)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        })
      }
      
      console.error('Error updating preferences:', error)
      res.status(500).json({ error: 'Failed to update preferences' })
    }
  }
}
