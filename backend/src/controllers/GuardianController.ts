import { Request, Response } from 'express'
import { GuardianService } from '../services/GuardianService.js'
import { z } from 'zod'

export class GuardianController {
  private guardianService: GuardianService

  constructor() {
    this.guardianService = new GuardianService()
  }

  // GET /guardians
  async getGuardians(req: Request, res: Response) {
    try {
      const guardians = await this.guardianService.getGuardians()
      res.json(guardians)
    } catch (error) {
      console.error('Error fetching guardians:', error)
      res.status(500).json({ error: 'Failed to fetch guardians' })
    }
  }

  // POST /guardians
  async createGuardian(req: Request, res: Response) {
    try {
      const createSchema = z.object({
        name: z.string().min(1),
        label: z.string().optional(),
      })

      const validatedData = createSchema.parse(req.body)
      const guardian = await this.guardianService.createGuardian(validatedData)
      
      res.status(201).json(guardian)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        })
      }
      
      console.error('Error creating guardian:', error)
      res.status(500).json({ error: 'Failed to create guardian' })
    }
  }

  // DELETE /guardians/:id
  async deleteGuardian(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const success = await this.guardianService.deleteGuardian(id)
      
      if (!success) {
        return res.status(404).json({ error: 'Guardian not found' })
      }
      
      res.status(204).send()
    } catch (error) {
      console.error('Error deleting guardian:', error)
      res.status(500).json({ error: 'Failed to delete guardian' })
    }
  }
}
