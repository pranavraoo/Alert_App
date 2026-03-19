import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { prisma } from '../src/lib/db.js'

type SeedAlert = {
  id: string
  title: string
  description: string
  category: string
  severity: string
  summary?: string
  suggested_action?: string
  reason?: string
  confidence?: string
  source?: string
  location?: string | null
  date: string
  resolved?: boolean
  affects_me?: boolean
  created_at?: string
}

async function main() {
  // Reuse the synthetic dataset shipped with the frontend repo.
  const filePath = path.join(process.cwd(), 'data', 'alerts.json')
  const raw = await readFile(filePath, 'utf-8')
  const alerts = JSON.parse(raw) as SeedAlert[]

  await prisma.alert.createMany({
    data: alerts.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category,
      severity: a.severity,
      summary: a.summary ?? '',
      suggested_action: a.suggested_action ?? '',
      reason: a.reason ?? '',
      confidence: a.confidence ?? 'high',
      source: a.source ?? 'User',
      location: a.location ?? null,
      date: a.date,
      resolved: a.resolved ?? false,
      affects_me: a.affects_me ?? false,
      created_at: a.created_at ? new Date(a.created_at) : undefined,
    })),
    skipDuplicates: true,
  })

  await prisma.userPreference.upsert({
    where: { id: 'default' },
    create: { id: 'default', concerns: [], theme: 'system' },
    update: {},
  })
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

