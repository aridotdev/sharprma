import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'
import { eq } from 'drizzle-orm'
import { PHOTO_TYPES, FIELD_NAMES } from '../../shared/utils/constant'

// Load environment variables if needed
import 'dotenv/config'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
})

const db = drizzle(client, { schema })

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Seed Vendors
  console.log('Seeding vendors...')
  const vendorData = [
    { name: 'MOKA', isActive: true },
    { name: 'MTC', isActive: true },
    { name: 'SDP', isActive: true }
  ]

  const vendors = []
  for (const v of vendorData) {
    let inserted
    // Check for existing vendor by name manually since no UNIQUE constraint
    const existing = await db.select().from(schema.vendor).where(eq(schema.vendor.name, v.name)).limit(1)

    if (existing.length > 0) {
      inserted = existing[0]
      console.log(`Vendor ${v.name} exists, skipping insert.`)
    } else {
      const rows = await db.insert(schema.vendor).values(v).returning()
      inserted = rows[0]
      console.log(`Vendor ${v.name} inserted.`)
    }
    vendors.push(inserted)
  }

  // NOTE: If vendors are duplicated because name is not unique in schema yet, we might get duplicates.
  // Let's ensure we get the right IDs.
  // Actually schema.vendor has no unique index on name in current code, but let's assume valid data.
  // Ideally we should add UNIQUE to vendor.name, but following AGENTS.md STRICTLY.

  // 2. Seed Product Models (Samples)
  console.log('Seeding product models...')
  // Assuming first vendor is MOKA for these samples
  const mokaVendor = vendors.find(v => v.name === 'MOKA')
  if (mokaVendor) {
    const models = [
      { modelName: '2T-C32BD1I', inch: '32', vendorId: mokaVendor.id },
      { modelName: '2T-C42BD1I', inch: '42', vendorId: mokaVendor.id },
      { modelName: '4T-C50BK1I', inch: '50', vendorId: mokaVendor.id }
    ]

    for (const m of models) {
      await db.insert(schema.productModel)
        .values(m)
        .onConflictDoUpdate({
          target: schema.productModel.modelName,
          set: { inch: m.inch }
        })
        .run()
    }
  }

  // 3. Seed Photo Rules
  console.log('Seeding vendor photo rules...')
  const photoRules = []

  // Helper to required true/false based on chart
  // MOKA (Vendor 1), MTC (Vendor 2), SDP (Vendor 3)
  // Types: CLAIM, CLAIM_ZOOM, ODF, PANEL_SN, WO_PANEL, WO_PANEL_SN

  const rulesConfig = {
    MOKA: ['CLAIM', 'CLAIM_ZOOM', 'ODF', 'PANEL_SN', 'WO_PANEL', 'WO_PANEL_SN'],
    MTC: ['CLAIM', 'CLAIM_ZOOM', 'ODF', 'PANEL_SN'],
    SDP: ['CLAIM', 'CLAIM_ZOOM', 'ODF', 'PANEL_SN']
  }

  for (const v of vendors) {
    // @ts-expect-error - indexing with string on predefined Vendor names
    const requiredTypes = rulesConfig[v.name] || []

    for (const type of PHOTO_TYPES) {
      await db.insert(schema.vendorPhotoRule)
        .values({
          vendorId: v.id,
          photoType: type,
          isRequired: requiredTypes.includes(type),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .onConflictDoUpdate({
          target: [schema.vendorPhotoRule.vendorId, schema.vendorPhotoRule.photoType],
          set: { isRequired: requiredTypes.includes(type), updatedAt: new Date().toISOString() }
        })
        .run()
    }
  }

  // 4. Seed Vendor Field Rules
  console.log('Seeding vendor field rules...')

  // MOKA (Vendor 1) requires all fields. MTC and SDP require none.
  const fieldRulesConfig = {
    MOKA: ['odfNumber', 'version', 'week'],
    MTC: [],
    SDP: []
  }

  for (const v of vendors) {
    // @ts-expect-error - indexing with string on predefined Vendor names
    const requiredFields = fieldRulesConfig[v.name] || []

    for (const field of FIELD_NAMES) {
      await db.insert(schema.vendorFieldRule)
        .values({
          vendorId: v.id,
          fieldName: field,
          isRequired: requiredFields.includes(field),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .onConflictDoUpdate({
          target: [schema.vendorFieldRule.vendorId, schema.vendorFieldRule.fieldName],
          set: { isRequired: requiredFields.includes(field), updatedAt: new Date().toISOString() }
        })
        .run()
    }
  }

  console.log('✅ Seed completed!')
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
