import 'dotenv/config'
import { prisma } from '../src/lib/db.js'
import { readFileSync } from 'fs'
import { join } from 'path'

async function main() {
  console.log('🌱 Starting database seed...')
  
  try {
    // Read alerts from data/alerts.json
    const alertsPath = join(process.cwd(), 'data', 'alerts.json')
    const alertsData = JSON.parse(readFileSync(alertsPath, 'utf-8'))
    console.log(`📁 Loaded ${alertsData.length} alerts from data/alerts.json`)
    
    // Transform data to match schema
    const transformedAlerts = alertsData.map((alert: any) => ({
      id: alert.id, // Keep original string IDs (schema allows override)
      title: alert.title,
      description: alert.description,
      category: alert.category,
      severity: alert.severity,
      summary: alert.summary || '',
      suggested_action: alert.suggested_action || '',
      reason: alert.reason || '',
      confidence: alert.confidence || 'high',
      source: alert.source || 'User',
      location: alert.location || null,
      date: alert.date,
      resolved: alert.resolved || false,
      affects_me: alert.affects_me || false,
      verification_count: alert.verification_count || 0,
      verification_status: alert.verification_status || 'pending',
      created_at: new Date(alert.created_at) // Convert string to DateTime
    }))
    
    // Insert alerts with duplicate handling
    const alertsResult = await prisma.alert.createMany({
      data: transformedAlerts,
      skipDuplicates: true
    })
    console.log(`✅ Created ${alertsResult.count} alerts`)
    
    // Sample guardians
    const guardians = [
      {
        id: 'guardian-001',
        name: 'John Smith',
        label: 'Security Expert',
        created_at: new Date('2024-01-15')
      },
      {
        id: 'guardian-002',
        name: 'Sarah Johnson', 
        label: 'Community Watch',
        created_at: new Date('2024-02-01')
      },
      {
        id: 'guardian-003',
        name: 'Mike Chen',
        label: 'IT Professional',
        created_at: new Date('2024-02-20')
      }
    ]
    
    const guardiansResult = await prisma.guardian.createMany({
      data: guardians,
      skipDuplicates: true
    })
    console.log(`👥 Created ${guardiansResult.count} guardians`)
    
    // Default user preferences
    const preferences = {
      id: 'default',
      concerns: ['Phishing', 'Scam', 'Local safety', 'CVE'],
      theme: 'system',
      quiet_start: null,
      quiet_end: null,
      updated_at: new Date()
    }
    
    await prisma.userPreference.upsert({
      where: { id: preferences.id },
      create: preferences,
      update: preferences
    })
    console.log('⚙️ Created default user preferences')
    
    // Sample verifications for some alerts
    const verifications = [
      {
        alert_id: 'seed-001',
        verification_type: 'verified',
        created_at: new Date()
      },
      {
        alert_id: 'seed-001',
        verification_type: 'verified',
        created_at: new Date()
      },
      {
        alert_id: 'seed-004',
        verification_type: 'verified',
        created_at: new Date()
      }
    ]
    
    await prisma.alertVerification.createMany({
      data: verifications,
      skipDuplicates: true
    })
    console.log(`✅ Created ${verifications.length} sample verifications`)
    
    console.log('\n🎉 Database seeded successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Alerts: ${alertsResult.count}`)
    console.log(`   - Guardians: ${guardiansResult.count}`)
    console.log(`   - Preferences: 1`)
    console.log(`   - Verifications: ${verifications.length}`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
