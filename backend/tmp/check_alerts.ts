import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const alerts = await prisma.alert.findMany({
    orderBy: { created_at: 'desc' },
    take: 5
  })
  console.log(JSON.stringify(alerts, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
