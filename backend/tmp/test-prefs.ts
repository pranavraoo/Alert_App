import { AlertService } from '../src/services/AlertService.js'
import { prisma } from '../src/lib/db.js'
import { SmartCategoryMatcher } from '../src/lib/smartCategoryMatcher.js'
import fs from 'fs'

async function test() {
  const log = (msg: string) => fs.appendFileSync('tmp/debug.log', msg + '\n')
  fs.writeFileSync('tmp/debug.log', '--- DEBUG START ---\n')
  
  const prefs = await prisma.userPreference.findFirst()
  log("User Concerns: " + JSON.stringify(prefs?.concerns))
  
  const matched = SmartCategoryMatcher.matchConcernsToCategories(prefs?.concerns as string[] || [])
  log("Matched Categories: " + JSON.stringify(matched))
  
  const service = new AlertService()
  const result = await service.getAlerts({})
  log("Results Count: " + result.data.length)
  
  const scamAlerts = result.data.filter(a => a.category === 'Scam')
  log("Scams in result: " + scamAlerts.length)
  
  if (result.data.length > 0) {
     log("Sample Result 0 Category: " + result.data[0].category)
  }

  log("--- DEBUG END ---")
  await prisma.$disconnect()
}

test().catch(err => fs.writeFileSync('tmp/debug.log', err.stack))
