// server/database/schema/claim.ts
import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { vendor } from './vendor'
import { productModel } from './product-model'
import { notificationMaster } from './notification-master'
import { defectMaster } from './defect-master'
import { CLAIM_STATUSES } from '../../../shared/utils/constants'

export const claim = sqliteTable('claim', {
  id: integer().primaryKey({ autoIncrement: true }),
  claimNumber: text().notNull().unique(),
  notificationId: integer().notNull().references(() => notificationMaster.id, { onDelete: 'restrict' }),
  modelId: integer().notNull().references(() => productModel.id, { onDelete: 'restrict' }),
  vendorId: integer().notNull().references(() => vendor.id, { onDelete: 'restrict' }),
  inch: integer().notNull(),
  branch: text().notNull(),
  odfNumber: text(),
  panelSerialNo: text().notNull(),
  ocSerialNo: text().notNull(),
  defectCode: text().notNull().references(() => defectMaster.code, { onDelete: 'restrict' }),
  version: text(),
  week: text(),
  claimStatus: text().notNull().$type<typeof CLAIM_STATUSES[number]>(),
  submittedBy: integer().notNull(),
  updatedBy: integer().notNull(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => new Date())
}, table => [
  uniqueIndex('claim_number_idx').on(table.claimNumber),
  index('claim_vendor_idx').on(table.vendorId),
  index('claim_status_idx').on(table.claimStatus),
  index('claim_submitted_by_idx').on(table.submittedBy),
  index('claim_vendor_status_idx').on(table.vendorId, table.claimStatus)
])

export const insertClaimSchema = createInsertSchema(claim, {
  claimNumber: z.string().min(1, 'Claim number is required').trim(),
  notificationId: z.number().int('Notification ID must be integer').positive('Invalid notification ID'),
  modelId: z.number().int('Model ID must be integer').positive('Invalid model ID'),
  vendorId: z.number().int('Vendor ID must be integer').positive('Invalid vendor ID'),
  inch: z.number().int().positive('Inch size must be positive'),
  branch: z.string().min(1, 'Branch is required').trim(),
  panelSerialNo: z.string().min(1, 'Panel SN is required').trim(),
  ocSerialNo: z.string().min(1, 'OC SN is required').trim(),
  defectCode: z.string().min(1, 'Defect code is required').trim(),
  claimStatus: z.enum(CLAIM_STATUSES),
  submittedBy: z.number().int().positive(),
  updatedBy: z.number().int().positive()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectClaimSchema = createSelectSchema(claim)

export const updateClaimSchema = insertClaimSchema.partial().omit({
  claimNumber: true,
  submittedBy: true
})

export type Claim = typeof claim.$inferSelect
export type InsertClaim = z.infer<typeof insertClaimSchema>
export type UpdateClaim = z.infer<typeof updateClaimSchema>
