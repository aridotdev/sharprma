import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { claimPhoto } from './claim-photo'
import { user } from './user'

export const photoReview = sqliteTable('photo_review', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  claimPhotoId: integer('claim_photo_id').references(() => claimPhoto.id).notNull(),
  reviewedBy: integer('reviewed_by').references(() => user.id).notNull(),
  status: text('status', { enum: ['VERIFIED', 'REJECT'] }).notNull(),
  note: text('note'),
  reviewedAt: text('reviewed_at').notNull().default(new Date().toISOString()),
})