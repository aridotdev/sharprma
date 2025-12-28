import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'
import { user } from './user'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const claim = sqliteTable('claim', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  claimNumber: text('claim_number').notNull().unique(),
  notification: text('notification').notNull(),
  modelName: text('model_name').notNull(),
  vendorId: integer('vendor_id').references(() => vendor.id, { onDelete: 'restrict' }).notNull(),
  inch: text('inch').notNull(),
  branch: text('branch').notNull(),
  odfNumber: text('odf_number'),
  panelSerialNo: text('panel_serial_no').notNull(),
  ocSerialNo: text('oc_serial_no').notNull(),
  defect: text('defect').notNull(),
  version: text('version'),
  week: text('week'),
  claimStatus: text('claim_status').notNull().default('DRAFT'),
  submittedBy: integer('submitted_by').references(() => user.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
}, (table) => [
  uniqueIndex('claim_number_idx').on(table.claimNumber),
  index('claim_vendor_idx').on(table.vendorId),
  index('claim_status_idx').on(table.claimStatus),
  index('claim_submitted_by_idx').on(table.submittedBy),
  index('claim_vendor_status_idx').on(table.vendorId, table.claimStatus)
])

// Zod schemas for validation
export const insertClaimSchema = createInsertSchema(claim, {
  claimNumber: z.string().min(1, 'Claim number is required').max(50, 'Claim number must be less than 50 characters'),
  notification: z.string().max(50, 'Notification must be less than 50 characters').trim().optional(),
  modelName: z.string().min(1, 'Model name is required').max(100, 'Model name must be less than 100 characters').trim(),
  vendorId: z.number().int().positive('Vendor ID must be a positive integer'),
  inch: z.string().min(1, 'Inch size is required').max(5, 'Inch size must be less than 5 characters'),
  branch: z.string().min(1, 'Branch is required').max(50, 'Branch must be less than 50 characters').trim(),
  odfNumber: z.string().max(50, 'ODF number must be less than 50 characters').trim().optional(),
  panelSerialNo: z.string().min(1, 'Panel serial number is required').max(50, 'Panel serial number must be less than 50 characters').trim(),
  ocSerialNo: z.string().min(1, 'OC serial number is required').max(50, 'OC serial number must be less than 50 characters').trim(),
  defect: z.string().min(1, 'Defect description is required').max(100, 'Defect description must be less than 100 characters').trim(),
  version: z.string().max(20, 'Version must be less than 20 characters').trim().optional(),
  week: z.string().max(10, 'Week must be less than 10 characters'),
  claimStatus: z.enum(CLAIM_STATUSES, {
    message: 'Claim status must be one of: DRAFT, SUBMITTED, IN_REVIEW, NEED_REVISION, APPROVED, CANCELLED'
  }).default('DRAFT'),
  submittedBy: z.number().int().positive('Submitted by user ID must be a positive integer').optional()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectClaimSchema = createSelectSchema(claim)

export const updateClaimSchema = insertClaimSchema.partial()

export const claimStatusTransitionSchema = z.object({
  claimId: z.number().int().positive('Claim ID must be a positive integer'),
  fromStatus: z.enum(CLAIM_STATUSES),
  toStatus: z.enum(CLAIM_STATUSES),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').trim().optional()
})

export type SelectClaim = typeof claim.$inferSelect
export type InsertClaim = z.infer<typeof insertClaimSchema>
export type UpdateClaim = z.infer<typeof updateClaimSchema>
export type ClaimStatusTransition = z.infer<typeof claimStatusTransitionSchema>
