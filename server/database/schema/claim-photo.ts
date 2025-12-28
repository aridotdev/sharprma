import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core'
import { claim } from './claim'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'



export const claimPhoto = sqliteTable('claim_photo', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  claimId: integer('claim_id').references(() => claim.id, { onDelete: 'cascade' }).notNull(),
  photoType: text('photo_type').notNull(),
  filePath: text('file_path').notNull(),
  status: text('status').notNull().default('PENDING'),
  reviewNote: text('review_note').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
}, (table) => [
  index('claim_photo_claim_idx').on(table.claimId),
  index('claim_photo_status_idx').on(table.status)
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
export type PhotoReview = z.infer<typeof photoReviewSchema>
