import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'
import { user } from './user'

export const vendorClaim = sqliteTable('vendor_claim', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vendorClaimNo: text('vendor_claim_no').notNull().unique(),
  vendorId: integer('vendor_id').references(() => vendor.id).notNull(),
  submittedAt: text('submitted_at').notNull(),
  reportSnapshot: text('report_snapshot').notNull(),
  createdBy: integer('created_by').references(() => user.id).notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
})