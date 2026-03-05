import { auth } from '../utils/auth'

async function seed() {
  console.log('🌱 Starting seed process...')

  const defaultPassword = 'sharp1234'
  const users = [
    {
      email: 'admin@sharp.com',
      name: 'Super Admin',
      role: 'ADMIN',
      branch: 'HQ'
    },
    {
      email: 'management@sharp.com',
      name: 'Management User',
      role: 'MANAGEMENT',
      branch: 'HQ'
    },
    {
      email: 'qrcc@sharp.com',
      name: 'QRCC User',
      role: 'QRCC',
      branch: 'HQ'
    },
    {
      email: 'cs@sharp.com',
      name: 'CS Cabang Jakarta',
      role: 'CS',
      branch: 'Jakarta'
    }
  ]

  let createdCount = 0

  for (const userData of users) {
    try {
      console.log(`Creating user: ${userData.email}...`)
      // Admin plugin exposes createUser API
      const result = await auth.api.createUser({
        body: {
          email: userData.email,
          password: defaultPassword,
          name: userData.name,
          role: userData.role,
          // Extra business fields
          data: {
            branch: userData.branch,
            isActive: true,
            emailVerified: true
          }
        }
      })

      if (result) {
        createdCount++
        console.log(`✅ Successfully created user: ${userData.email} (Role: ${userData.role})`)
      }
    } catch (error: any) {
      if (error?.message?.includes('already exists') || error?.status === 400) {
        console.log(`⚠️ User ${userData.email} may already exist or error: ${error.message}`)
      } else {
        console.error(`❌ Failed to create user ${userData.email}:`, error)
      }
    }
  }

  console.log(`\n🎉 Seeding completed. ${createdCount} users created.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Fatal error during seeding:', err)
  process.exit(1)
})
