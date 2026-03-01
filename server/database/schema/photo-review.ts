// server/database/schema/photo-review.ts
import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { claimPhoto } from './claim-photo'
import { CLAIM_PHOTO_STATUSES } from '../../../shared/utils/constants'

export const photoReview = sqliteTable('photo_review', {
  id: integer().primaryKey({ autoIncrement: true }),
  claimPhotoId: integer().notNull().references(() => claimPhoto.id, { onDelete: 'restrict' }),
  reviewedBy: integer().notNull(), // User reference
  status: text().notNull().$type<typeof CLAIM_PHOTO_STATUSES[number]>(),
  rejectReason: text(),
  reviewedAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
}, table => [
  index('photo_review_claim_photo_idx').on(table.claimPhotoId),
  index('photo_review_reviewer_idx').on(table.reviewedBy)
])

export const insertPhotoReviewSchema = createInsertSchema(photoReview, {
  claimPhotoId: z.number().int().positive(),
  reviewedBy: z.number().int().positive(),
  status: z.enum(CLAIM_PHOTO_STATUSES)
}).omit({
  id: true,
  reviewedAt: true
})

export const selectPhotoReviewSchema = createSelectSchema(photoReview)

export type PhotoReview = typeof photoReview.$inferSelect
export type InsertPhotoReview = z.infer<typeof insertPhotoReviewSchema>
