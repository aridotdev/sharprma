import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core'
import { vendorClaim } from './vendor-claim'
import { claim } from './claim'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { VENDOR_DECISIONS } from '../../../shared/utils/constant'

export const vendorClaimItem = sqliteTable('vendor_claim_item', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  claimId: integer('claim_id').references(() => claim.id, { onDelete: 'restrict' }).notNull(),
  vendorClaimId: integer('vendor_claim_id').references(() => vendorClaim.id, { onDelete: 'cascade' }).notNull(),
  vendorDecision: text('vendor_decision').notNull(),
  compensationAmount: integer('compensation_amount'),
  note: text('note'),
  decisionAt: text('decision_at').notNull()
}, table => [
  index('vendor_claim_item_vendor_claim_idx').on(table.vendorClaimId),
  index('vendor_claim_item_claim_idx').on(table.claimId)
])

// Zod schemas for validation
export const insertVendorClaimItemSchema = createInsertSchema(vendorClaimItem, {
  vendorClaimId: z.number().int().positive('Vendor claim ID must be a positive integer'),
  claimId: z.number().int().positive('Claim ID must be a positive integer'),
  vendorDecision: z.enum(VENDOR_DECISIONS, {
    message: 'Vendor decision must be one of: PENDING, ACCEPTED, REJECTED, PARTIAL'
  }),
  compensationAmount: z.number().int().min(0, 'Compensation amount must be non-negative').optional(),
  note: z.string().max(1000, 'Note must be less than 1000 characters').trim().optional(),
  decisionAt: z.string().min(1, 'Decision at is required')
}).omit({
  id: true
})

export const selectVendorClaimItemSchema = createSelectSchema(vendorClaimItem)

export const updateVendorClaimItemSchema = insertVendorClaimItemSchema.partial()

export type SelectVendorClaimItem = typeof vendorClaimItem.$inferSelect
export type InsertVendorClaimItem = z.infer<typeof insertVendorClaimItemSchema>
export type UpdateVendorClaimItem = z.infer<typeof updateVendorClaimItemSchema>
