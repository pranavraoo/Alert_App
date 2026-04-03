import { Request, Response } from 'express'
import { AlertService } from '../services/AlertService.js'
import { z } from 'zod'

export class AlertController {
  private alertService: AlertService

  constructor() {
    this.alertService = new AlertService()
  }

  // GET /alerts
  async getAlerts(req: Request, res: Response) {
    try {
      const { 
        category, 
        severity, 
        status, 
        source, 
        location, 
        affects_me, 
        search,
        view,
        page = '1',
        limit = '10'
      } = req.query
      
      const filters = {
        category: category as string,
        severity: severity as string,
        status: status as string,
        source: source as string,
        location: location as string,
        ...(affects_me !== undefined ? { affects_me: affects_me === 'true' } : {}),
        search: search as string,
        view: view as string,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10
      }

      const result = await this.alertService.getAlerts(filters)
      res.json(result)
    } catch (error) {
      console.error('Error fetching alerts:', error)
      res.status(500).json({ error: 'Failed to fetch alerts' })
    }
  }

  // POST /alerts
  async createAlert(req: Request, res: Response) {
    try {
      const createSchema = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        category: z.string().min(1),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        summary: z.string().optional(),
        suggested_action: z.string().optional(),
        reason: z.string().optional(),
        confidence: z.enum(['high', 'low']).default('high'),
        source: z.enum(['CISA', 'PhishTank', 'NVD', 'User']).default('User'),
        location: z.string().optional(),
        date: z.string(),
        resolved: z.boolean().default(false),
        affects_me: z.boolean().default(false),
      })

      const validatedData = createSchema.parse(req.body)
      const alert = await this.alertService.createAlert(validatedData)
      
      res.status(201).json(alert)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        })
      }
      
      console.error('Error creating alert:', error)
      res.status(500).json({ error: 'Failed to create alert' })
    }
  }

  // GET /alerts/:id
  async getAlert(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const alert = await this.alertService.getAlertById(id)
      
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' })
      }
      
      res.json(alert)
    } catch (error) {
      console.error('Error fetching alert:', error)
      res.status(500).json({ error: 'Failed to fetch alert' })
    }
  }

  // PATCH /alerts/:id
  async updateAlert(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const updateSchema = z.object({
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        summary: z.string().optional(),
        suggested_action: z.string().optional(),
        reason: z.string().optional(),
        confidence: z.enum(['high', 'low']).optional(),
        location: z.string().optional(),
        resolved: z.boolean().optional(),
        affects_me: z.boolean().optional(),
      })

      const validatedData = updateSchema.parse(req.body)
      const alert = await this.alertService.updateAlert(id, validatedData)
      
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' })
      }
      
      res.json(alert)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        })
      }
      
      console.error('Error updating alert:', error)
      res.status(500).json({ error: 'Failed to update alert' })
    }
  }

  // DELETE /alerts/:id
  async deleteAlert(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const success = await this.alertService.deleteAlert(id)
      
      if (!success) {
        return res.status(404).json({ error: 'Alert not found' })
      }
      
      res.status(204).send()
    } catch (error) {
      console.error('Error deleting alert:', error)
      res.status(500).json({ error: 'Failed to delete alert' })
    }
  }

  // POST /alerts/:id/verify
  async verifyAlert(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { verification_type } = req.body
      
      const verifySchema = z.object({
        verification_type: z.enum(['verified', 'fake', 'disputed']),
      })

      const validatedData = verifySchema.parse({ verification_type })
      const alert = await this.alertService.verifyAlert(id, validatedData.verification_type)
      
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' })
      }
      
      res.json(alert)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        })
      }
      
      console.error('Error verifying alert:', error)
      res.status(500).json({ error: 'Failed to verify alert' })
    }
  }

  // GET /alerts/:id/verifications
  async getVerificationHistory(req: Request, res: Response) {
    try {
      const { id } = req.params
      
      const history = await this.alertService.getVerificationHistory(id)
      
      // Always return 200 with the data (even if empty)
      res.json(history)
    } catch (error) {
      console.error('Error fetching verification history:', error)
      res.status(500).json({ error: 'Failed to fetch verification history' })
    }
  }
}
