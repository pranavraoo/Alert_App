import cors from 'cors'
import express from 'express'
import dotenv from 'dotenv'
import { prisma } from './lib/db.js'
import routes from './routes/index.js'

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes (remove /api prefix to match frontend expectations)
app.use('/', routes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' })
})

const port = Number(process.env.PORT ?? '4000')
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`)
})

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...')
  server.close(async () => {
    console.log('HTTP server closed.')
    await prisma.$disconnect()
    console.log('Database connection closed.')
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

