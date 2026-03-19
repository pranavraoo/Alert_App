import { Router } from 'express'
import { AlertController } from '../controllers/AlertController.js'
import { GuardianController } from '../controllers/GuardianController.js'
import { PreferencesController } from '../controllers/PreferencesController.js'
import { CategorizeController } from '../controllers/CategorizeController.js'
import { QueryController } from '../controllers/QueryController.js'

const router = Router()

// Initialize controllers
const alertController = new AlertController()
const guardianController = new GuardianController()
const preferencesController = new PreferencesController()
const categorizeController = new CategorizeController()
const queryController = new QueryController()

// Alert routes
router.get('/alerts', (req, res) => alertController.getAlerts(req, res))
router.post('/alerts', (req, res) => alertController.createAlert(req, res))
router.get('/alerts/:id', (req, res) => alertController.getAlert(req, res))
router.patch('/alerts/:id', (req, res) => alertController.updateAlert(req, res))
router.delete('/alerts/:id', (req, res) => alertController.deleteAlert(req, res))
router.post('/alerts/:id/verify', (req, res) => alertController.verifyAlert(req, res))
router.get('/alerts/:id/verifications', (req, res) => alertController.getVerificationHistory(req, res))

// Guardian routes
router.get('/guardians', (req, res) => guardianController.getGuardians(req, res))
router.post('/guardians', (req, res) => guardianController.createGuardian(req, res))
router.delete('/guardians/:id', (req, res) => guardianController.deleteGuardian(req, res))

// Preferences routes
router.get('/preferences', (req, res) => preferencesController.getPreferences(req, res))
router.patch('/preferences', (req, res) => preferencesController.updatePreferences(req, res))

// Categorize route
router.post('/categorize', (req, res) => categorizeController.categorize(req, res))

// Query route
router.post('/query', (req, res) => queryController.handleQuery(req, res))

export default router
