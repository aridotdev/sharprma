// server/database/schema/claim-photo.ts
import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { claim } from './claim'
import { PHOTO_TYPES, CLAIM_PHOTO_STATUSES } from '../../../shared/utils/constants'

export const claimPhoto = sqliteTable('claim_photo', {
  id: integer().primaryKey({ autoIncrement: true }),
  claimId: integer().notNull().references(() => claim.id, { onDelete: 'restrict' }),
  photoType: text().notNull().$type<typeof PHOTO_TYPES[number]>(),
  filePath: text().notNull(),
  thumbnailPath: text(),
  status: text().notNull().default('PENDING').$type<typeof CLAIM_PHOTO_STATUSES[number]>(),
  rejectReason: text(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => new Date())
}, table => [
  uniqueIndex('claim_photo_claim_type_idx').on(table.claimId, table.photoType),
  index('claim_photo_claim_idx').on(table.claimId)
])

export const insertClaimPhotoSchema = createInsertSchema(claimPhoto, {
  claimId: z.number().int().positive(),
  photoType: z.enum(PHOTO_TYPES),
  filePath: z.string().min(1, 'File path is required'),
  status: z.enum(CLAIM_PHOTO_STATUSES).default('PENDING')
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectClaimPhotoSchema = createSelectSchema(claimPhoto)

export const updateClaimPhotoSchema = insertClaimPhotoSchema.partial().omit({
  claimId: true,
  photoType: true
})

export type ClaimPhoto = typeof claimPhoto.$inferSelect
export type InsertClaimPhoto = z.infer<typeof insertClaimPhotoSchema>
export type UpdateClaimPhoto = z.infer<typeof updateClaimPhotoSchema>
