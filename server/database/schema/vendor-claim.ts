// server/database/schema/vendor-claim.ts
import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { vendor } from './vendor'
import { VENDOR_CLAIM_STATUSES } from '../../../shared/utils/constants'

export const vendorClaim = sqliteTable('vendor_claim', {
  id: integer().primaryKey({ autoIncrement: true }),
  vendorClaimNo: text().notNull().unique(),
  vendorId: integer().notNull().references(() => vendor.id, { onDelete: 'restrict' }),
  submittedAt: integer({ mode: 'timestamp_ms' }).notNull(),
  reportSnapshot: text().notNull(), // JSON data stored as text
  status: text().notNull().$type<typeof VENDOR_CLAIM_STATUSES[number]>(),
  createdBy: integer().notNull(),
  updatedBy: integer().notNull(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => new Date())
}, table => [
  uniqueIndex('vendor_claim_no_idx').on(table.vendorClaimNo),
  index('vendor_claim_vendor_idx').on(table.vendorId),
  index('vendor_claim_status_idx').on(table.status),
  index('vendor_claim_created_at_idx').on(table.createdAt)
])

export const insertVendorClaimSchema = createInsertSchema(vendorClaim, {
  vendorClaimNo: z.string().min(1, 'Vendor claim number required'),
  vendorId: z.number().int().positive(),
  submittedAt: z.number().int(),
  reportSnapshot: z.string(),
  status: z.enum(VENDOR_CLAIM_STATUSES),
  createdBy: z.number().int().positive(),
  updatedBy: z.number().int().positive()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectVendorClaimSchema = createSelectSchema(vendorClaim)

export const updateVendorClaimSchema = insertVendorClaimSchema.partial().omit({
  createdBy: true,
  vendorClaimNo: true
})

export type VendorClaim = typeof vendorClaim.$inferSelect
export type InsertVendorClaim = z.infer<typeof insertVendorClaimSchema>
export type UpdateVendorClaim = z.infer<typeof updateVendorClaimSchema>
