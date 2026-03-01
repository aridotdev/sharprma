// server/database/schema/vendor-claim-item.ts
import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { vendorClaim } from './vendor-claim'
import { claim } from './claim'
import { VENDOR_DECISIONS } from '../../../shared/utils/constants'

export const vendorClaimItem = sqliteTable('vendor_claim_item', {
  id: integer().primaryKey({ autoIncrement: true }),
  vendorClaimId: integer().notNull().references(() => vendorClaim.id, { onDelete: 'cascade' }),
  claimId: integer().notNull().references(() => claim.id, { onDelete: 'restrict' }),
  vendorDecision: text().notNull().$type<typeof VENDOR_DECISIONS[number]>(),
  compensation: integer(),
  rejectReason: text(),
  vendorDecisionBy: integer(), // nullable because it can be empty until reviewed
  vendorDecisionAt: integer({ mode: 'timestamp_ms' }),
  createdAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => new Date())
}, table => [
  index('vendor_claim_item_vendor_claim_idx').on(table.vendorClaimId),
  index('vendor_claim_item_claim_idx').on(table.claimId)
])

export const insertVendorClaimItemSchema = createInsertSchema(vendorClaimItem, {
  vendorClaimId: z.number().int().positive(),
  claimId: z.number().int().positive(),
  vendorDecision: z.enum(VENDOR_DECISIONS),
  compensation: z.number().int().nonnegative().optional(),
  vendorDecisionBy: z.number().int().positive().optional(),
  vendorDecisionAt: z.number().int().positive().optional()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectVendorClaimItemSchema = createSelectSchema(vendorClaimItem)

export const updateVendorClaimItemSchema = insertVendorClaimItemSchema.partial().omit({
  vendorClaimId: true,
  claimId: true
})

export type VendorClaimItem = typeof vendorClaimItem.$inferSelect
export type InsertVendorClaimItem = z.infer<typeof insertVendorClaimItemSchema>
export type UpdateVendorClaimItem = z.infer<typeof updateVendorClaimItemSchema>
