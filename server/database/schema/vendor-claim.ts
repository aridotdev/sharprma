import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'
import { userRma } from './user-rma'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const VENDOR_CLAIM_STATUSES = ['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'PROCESSING', 'COMPLETED', 'REJECTED'] as const
export type VendorClaimStatus = typeof VENDOR_CLAIM_STATUSES[number]

export const vendorClaim = sqliteTable('vendor_claim', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vendorClaimNo: text('vendor_claim_no').notNull().unique(),
  vendorId: integer('vendor_id').references(() => vendor.id, { onDelete: 'restrict' }).notNull(),
  submittedAt: text('submitted_at').notNull(),
  reportSnapshot: text('report_snapshot').notNull(),
  createdBy: integer('created_by').references(() => userRma.id).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
}, table => [
  uniqueIndex('vendor_claim_no_idx').on(table.vendorClaimNo),
  index('vendor_claim_vendor_idx').on(table.vendorId),
  index('vendor_claim_created_by_idx').on(table.createdBy)
])

// Zod schemas for validation
export const insertVendorClaimSchema = createInsertSchema(vendorClaim, {
  vendorClaimNo: z.string().min(1, 'Vendor claim number is required').max(50, 'Vendor claim number must be less than 50 characters').regex(/^[A-Z0-9\-/]+$/, 'Vendor claim number must contain only uppercase letters, numbers, hyphens, and slashes').trim(),
  vendorId: z.number().int().positive('Vendor ID must be a positive integer'),
  submittedAt: z.string().min(1, 'Submitted at is required'),
  reportSnapshot: z.string().min(1, 'Report snapshot is required').max(10000, 'Report snapshot must be less than 10000 characters'),
  createdBy: z.number().int().positive('Created by user ID must be a positive integer')
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectVendorClaimSchema = createSelectSchema(vendorClaim)

export const updateVendorClaimSchema = insertVendorClaimSchema.partial()

export type SelectVendorClaim = typeof vendorClaim.$inferSelect
export type InsertVendorClaim = z.infer<typeof insertVendorClaimSchema>
export type UpdateVendorClaim = z.infer<typeof updateVendorClaimSchema>
