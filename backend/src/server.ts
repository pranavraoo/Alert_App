import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'
import { prisma } from './lib/db.js'
import type { Prisma } from '@prisma/client'
import { categorizeText } from './lib/ai/index.js'
import { fallbackCategorize } from './lib/fallback.js'

const app = express()
app.use(express.json({ limit: '1mb' }))

const origin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000'
app.use(
  cors({
    origin,
    credentials: false,
  }),
)

app.get('/health', (_req, res) => res.json({ ok: true }))

app.get('/alerts', async (req, res) => {
  const category = req.query.category?.toString()
  const severity = req.query.severity?.toString()
  const source = req.query.source?.toString()
  const location = req.query.location?.toString()
  const search = req.query.search?.toString()
  const status = req.query.status?.toString()
  const affectsMe = req.query.affects_me?.toString()

  const limit = Number(req.query.limit ?? '50')
  const offset = Number(req.query.offset ?? '0')

  const resolved =
    status === 'resolved' ? true : status === 'active' ? false : undefined

  const where: Prisma.AlertWhereInput = {
    ...(category ? { category } : {}),
    ...(severity ? { severity } : {}),
    ...(source ? { source } : {}),
    ...(location ? { location } : {}),
    ...(typeof resolved === 'boolean' ? { resolved } : {}),
    ...(affectsMe === 'true' ? { affects_me: true } : {}),
    ...(search
      ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }
      : {}),
  }

  const alerts = await prisma.alert.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: Math.min(Number.isFinite(limit) ? limit : 50, 200),
    skip: Number.isFinite(offset) ? offset : 0,
  })

  res.json(alerts)
})

app.post('/alerts', async (req, res) => {
  const body = req.body ?? {}
  const created = await prisma.alert.create({
    data: {
      title: String(body.title ?? '').trim(),
      description: String(body.description ?? '').trim(),
      category: String(body.category ?? '').trim(),
      severity: String(body.severity ?? '').trim(),
      summary: String(body.summary ?? '').trim(),
      suggested_action: String(body.suggested_action ?? '').trim(),
      reason: String(body.reason ?? '').trim(),
      confidence: String(body.confidence ?? 'high').trim(),
      source: String(body.source ?? 'User').trim(),
      location: body.location ? String(body.location).trim() : null,
      date: String(body.date ?? '').trim(),
      resolved: Boolean(body.resolved ?? false),
      affects_me: Boolean(body.affects_me ?? false),
    },
  })

  res.status(201).json(created)
})

app.get('/alerts/:id', async (req, res) => {
  const alert = await prisma.alert.findUnique({ where: { id: req.params.id } })
  if (!alert) return res.status(404).json({ error: 'Not found' })
  res.json(alert)
})

app.patch('/alerts/:id', async (req, res) => {
  const body = req.body ?? {}
  const updated = await prisma.alert.update({
    where: { id: req.params.id },
    data: {
      title: body.title !== undefined ? String(body.title).trim() : undefined,
      description:
        body.description !== undefined
          ? String(body.description).trim()
          : undefined,
      category:
        body.category !== undefined ? String(body.category).trim() : undefined,
      severity:
        body.severity !== undefined ? String(body.severity).trim() : undefined,
      summary: body.summary !== undefined ? String(body.summary).trim() : undefined,
      suggested_action:
        body.suggested_action !== undefined
          ? String(body.suggested_action).trim()
          : undefined,
      reason: body.reason !== undefined ? String(body.reason).trim() : undefined,
      confidence:
        body.confidence !== undefined
          ? String(body.confidence).trim()
          : undefined,
      source: body.source !== undefined ? String(body.source).trim() : undefined,
      location:
        body.location !== undefined
          ? body.location === null || body.location === ''
            ? null
            : String(body.location).trim()
          : undefined,
      date: body.date !== undefined ? String(body.date).trim() : undefined,
      resolved: body.resolved !== undefined ? Boolean(body.resolved) : undefined,
      affects_me:
        body.affects_me !== undefined ? Boolean(body.affects_me) : undefined,
    },
  })

  res.json(updated)
})

app.delete('/alerts/:id', async (req, res) => {
  await prisma.alert.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

app.get('/preferences', async (_req, res) => {
  const prefs = await prisma.userPreference.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', concerns: [], theme: 'system' },
  })
  res.json(prefs)
})

app.patch('/preferences', async (req, res) => {
  const prefs = await prisma.userPreference.upsert({
    where: { id: 'default' },
    update: req.body ?? {},
    create: { id: 'default', ...(req.body ?? {}) },
  })
  res.json(prefs)
})

app.get('/guardians', async (_req, res) => {
  const guardians = await prisma.guardian.findMany({ orderBy: { created_at: 'asc' } })
  res.json(guardians)
})

app.post('/guardians', async (req, res) => {
  const body = req.body ?? {}
  const count = await prisma.guardian.count()
  if (count >= 5) return res.status(400).json({ error: 'Maximum 5 guardians allowed' })

  const guardian = await prisma.guardian.create({
    data: { name: body.name, label: body.label || null },
  })
  res.status(201).json(guardian)
})

app.delete('/guardians/:id', async (req, res) => {
  await prisma.guardian.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

app.post('/categorize', async (req, res) => {
  const schema = z.object({ text: z.string().min(1) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Missing text' })

  try {
    const ai = await categorizeText(parsed.data.text)
    return res.json({ ...ai, used_fallback: false })
  } catch (error) {
    console.error('AI Categorization Error:', error)
    const fb = fallbackCategorize(parsed.data.text)
    return res.json({ ...fb, used_fallback: true })
  }
})

// ─── CISA KEV Feed ───────────────────────────────────────────────────────────
app.post('/feeds/cisa', async (_req, res) => {
  try {
    const response = await fetch(
      'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
    )
    const data = await response.json() as {
      vulnerabilities: Array<{
        cveID: string
        vulnerabilityName: string
        shortDescription: string
        requiredAction: string
        dateAdded: string
        dueDate: string
      }>
    }

    const latest = data.vulnerabilities.slice(0, 20)
    let inserted = 0

    for (const v of latest) {
      const existing = await prisma.alert.findUnique({ where: { id: v.cveID } })
      if (existing) continue

      await prisma.alert.create({
        data: {
          id: v.cveID,
          title: `${v.cveID}: ${v.vulnerabilityName}`,
          description: v.shortDescription,
          category: 'CVE',
          severity: 'high',
          summary: v.shortDescription.slice(0, 120),
          suggested_action: v.requiredAction || 'Apply vendor patch immediately.',
          reason: `CISA Known Exploited Vulnerability — Due: ${v.dueDate}`,
          confidence: 'high',
          source: 'CISA',
          location: 'Nationwide',
          date: v.dateAdded,
          resolved: false,
          affects_me: false,
        },
      })
      inserted++
    }

    res.json({ ok: true, inserted })
  } catch (error) {
    console.error('CISA feed error:', error)
    res.status(500).json({ error: 'Failed to fetch CISA feed' })
  }
})

// ─── NVD CVE Feed ────────────────────────────────────────────────────────────
app.post('/feeds/nvd', async (_req, res) => {
  try {
    const response = await fetch(
      'https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=15&startIndex=0'
    )
    const data = await response.json() as {
      vulnerabilities: Array<{
        cve: {
          id: string
          descriptions: Array<{ lang: string; value: string }>
          published: string
          metrics?: {
            cvssMetricV31?: Array<{
              cvssData: { baseScore: number }
            }>
          }
        }
      }>
    }

    let inserted = 0

    for (const item of data.vulnerabilities) {
      const cve = item.cve
      const existing = await prisma.alert.findUnique({ where: { id: cve.id } })
      if (existing) continue

      const desc = cve.descriptions.find((d) => d.lang === 'en')?.value ?? 'No description.'
      const score = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore ?? 0
      const severity =
        score >= 9 ? 'critical' :
          score >= 7 ? 'high' :
            score >= 4 ? 'medium' : 'low'

      await prisma.alert.create({
        data: {
          id: cve.id,
          title: cve.id,
          description: desc,
          category: 'CVE',
          severity,
          summary: desc.slice(0, 120),
          suggested_action: 'Check vendor advisory and apply available patches.',
          reason: `NVD CVSS Score: ${score}`,
          confidence: 'high',
          source: 'NVD',
          location: 'Nationwide',
          date: cve.published.split('T')[0],
          resolved: false,
          affects_me: false,
        },
      })
      inserted++
    }

    res.json({ ok: true, inserted })
  } catch (error) {
    console.error('NVD feed error:', error)
    res.status(500).json({ error: 'Failed to fetch NVD feed' })
  }
})

// ─── PhishTank Feed ──────────────────────────────────────────────────────────
// ─── OpenPhish Feed (replaces PhishTank) ─────────────────────────────────────
app.post('/feeds/phishtank', async (_req, res) => {
  try {
    const response = await fetch('https://openphish.com/feed.txt', {
      headers: { 'User-Agent': 'community-guardian/1.0' }
    })
    const text = await response.text()

    const urls = text.split('\n').filter((u) => u.trim().startsWith('http')).slice(0, 20)
    let inserted = 0

    for (const url of urls) {
      const id = `OP-${Buffer.from(url).toString('base64').slice(0, 16)}`
      const existing = await prisma.alert.findUnique({ where: { id } })
      if (existing) continue

      let hostname = url.trim()
      try { hostname = new URL(url.trim()).hostname } catch { }

      await prisma.alert.create({
        data: {
          id,
          title: `Active Phishing Site: ${hostname}`,
          description: `Verified active phishing URL: ${url.trim()}. Source: OpenPhish community feed.`,
          category: 'Phishing',
          severity: 'high',
          summary: `Active phishing site detected at ${hostname}.`,
          suggested_action: 'Do not visit this URL. Report if received via email or SMS.',
          reason: 'Verified by OpenPhish automated detection.',
          confidence: 'high',
          source: 'PhishTank',
          location: 'Nationwide',
          date: new Date().toISOString().split('T')[0],
          resolved: false,
          affects_me: false,
        },
      })
      inserted++
    }

    res.json({ ok: true, inserted })
  } catch (error) {
    console.error('OpenPhish feed error:', error)
    res.status(500).json({ error: 'Failed to fetch phishing feed' })
  }
})

const port = Number(process.env.PORT ?? '4000')
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`)
})

