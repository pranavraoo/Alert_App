import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function findRecent() {
  const alerts = await prisma.alert.findMany({
    orderBy: { created_at: 'desc' },
    take: 10
  })
  console.log("Recent Alerts in DB (Full detail):")
  alerts.forEach(a => {
    console.log(`- ID: ${a.id}, Title: ${a.title}, CreatedAt: ${a.created_at.toISOString()}, Severity: ${a.severity}, Resolved: ${a.resolved}`)
  })
}

findRecent().catch(console.error).finally(() => prisma.$disconnect())
