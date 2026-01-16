import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { claim } from './claim'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { CLAIM_PHOTO_STATUSES, PHOTO_TYPES } from '../../../shared/utils/constant'

// Database schema for claim_photo table
export const claimPhoto = sqliteTable('claim_photo', {
  id: integer().primaryKey({ autoIncrement: true }),
  claimId: integer().references(() => claim.id, { onDelete: 'cascade' }).notNull(),
  photoType: text().notNull(),
  filePath: text().notNull(),
  status: text().notNull().default('PENDING'),
  reviewNote: text().notNull().default(''),
  createdAt: integer({ mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().default(new Date())
}, (table) => [
  index('claim_photo_claim_idx').on(table.claimId),
  uniqueIndex('claim_photo_claim_id_photo_type_idx').on(table.claimId, table.photoType)
])

// Zod schemas for validation
export const insertClaimPhotoSchema = createInsertSchema(claimPhoto, {
  claimId: z.number().int().positive('Claim ID must be a positive integer'),
  photoType: z.enum(PHOTO_TYPES, {
    message: 'Photo type must be one of: CLAIM, CLAIM_ZOOM, ODF, PANEL_SN, WO_PANEL, WO_PANEL_SN'
  }),
  filePath: z.string().min(1, 'File path is required').max(500, 'File path must be less than 500 characters'),
  status: z.enum(CLAIM_PHOTO_STATUSES, {
    message: 'Status must be one of: PENDING, VERIFIED, REJECT, REPLACED'
  }).default('PENDING')
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectClaimPhotoSchema = createSelectSchema(claimPhoto)

export const updateClaimPhotoSchema = insertClaimPhotoSchema.partial()

export const photoReviewSchema = z.object({
  claimPhotoId: z.number().int().positive('Claim photo ID must be a positive integer'),
  status: z.enum(['VERIFIED', 'REJECT'], {
    message: 'Review status must be either VERIFIED or REJECT'
  }),
  reviewNote: z.string().max(500, 'Review note must be less than 500 characters').trim().optional()
})

export type SelectClaimPhoto = typeof claimPhoto.$inferSelect
export type InsertClaimPhoto = z.infer<typeof insertClaimPhotoSchema>
export type UpdateClaimPhoto = z.infer<typeof updateClaimPhotoSchema>
export type PhotoReviewRequest = z.infer<typeof photoReviewSchema>
