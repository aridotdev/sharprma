import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { claimPhoto } from './claim-photo'
import { user } from './user'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const PHOTO_REVIEW_STATUSES = ['VERIFIED', 'REJECT'] as const
export type PhotoReviewStatus = typeof PHOTO_REVIEW_STATUSES[number]

export const photoReview = sqliteTable('photo_review', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  claimPhotoId: integer('claim_photo_id').references(() => claimPhoto.id, { onDelete: 'cascade' }).notNull(),
  reviewedBy: integer('reviewed_by').references(() => user.id).notNull(),
  status: text('status').notNull(),
  note: text('note'),
  reviewedAt: text('reviewed_at').notNull()
}, (table) => ({
  claimPhotoIdx: index('photo_review_claim_photo_idx').on(table.claimPhotoId),
  reviewedByIdx: index('photo_review_reviewed_by_idx').on(table.reviewedBy),
  statusIdx: index('photo_review_status_idx').on(table.status)
}))

// Zod schemas for validation
export const insertPhotoReviewSchema = createInsertSchema(photoReview, {
  claimPhotoId: z.number().int().positive('Claim photo ID must be a positive integer'),
  reviewedBy: z.number().int().positive('Reviewed by user ID must be a positive integer'),
  status: z.enum(PHOTO_REVIEW_STATUSES, {
    message: 'Status must be either VERIFIED or REJECT'
  }),
  note: z.string().max(500, 'Note must be less than 500 characters').trim().optional(),
  reviewedAt: z.string().min(1, 'Reviewed at is required')
}).omit({
  id: true
})

export const selectPhotoReviewSchema = createSelectSchema(photoReview)

export const updatePhotoReviewSchema = insertPhotoReviewSchema.partial()

export const photoReviewActionSchema = z.object({
  claimPhotoId: z.number().int().positive('Claim photo ID must be a positive integer'),
  status: z.enum(PHOTO_REVIEW_STATUSES),
  note: z.string().max(500, 'Note must be less than 500 characters').trim().optional()
})

export type PhotoReview = typeof photoReview.$inferSelect
export type NewPhotoReview = typeof photoReview.$inferInsert
export type InsertPhotoReview = z.infer<typeof insertPhotoReviewSchema>
export type SelectPhotoReview = z.infer<typeof selectPhotoReviewSchema>
export type UpdatePhotoReview = z.infer<typeof updatePhotoReviewSchema>
export type PhotoReviewAction = z.infer<typeof photoReviewActionSchema>
