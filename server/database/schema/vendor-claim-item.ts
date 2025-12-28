import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { vendorClaim } from './vendor-claim'
import { claim } from './claim'

export const vendorClaimItem = sqliteTable('vendor_claim_item', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vendorClaimId: integer('vendor_claim_id').references(() => vendorClaim.id).notNull(),
  claimId: integer('claim_id').references(() => claim.id).notNull(),
  vendorDecision: text('vendor_decision', { enum: ['ACCEPTED', 'REJECTED'] }).notNull(),
  compensationAmount: integer('compensation_amount'),
  note: text('note'),
  decisionAt: text('decision_at').notNull(),
})