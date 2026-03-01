// server/database/schema/claim-history.ts
import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { claim } from './claim'
import { CLAIM_HISTORY_ACTIONS } from '../../../shared/utils/constants'

// Note: userId references profile.id (integer)
// UserRole is just a snapshot

export const claimHistory = sqliteTable('claim_history', {
  id: integer().primaryKey({ autoIncrement: true }),
  claimId: integer().notNull().references(() => claim.id, { onDelete: 'restrict' }),
  action: text().notNull().$type<typeof CLAIM_HISTORY_ACTIONS[number]>(),
  fromStatus: text().notNull(),
  toStatus: text().notNull(),
  userId: integer().notNull(), // FK mapped logically, no restrict needed based on spec note
  userRole: text().notNull(),
  note: text(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
}, table => [
  index('claim_history_claim_idx').on(table.claimId),
  index('claim_history_user_idx').on(table.userId)
])

export const insertClaimHistorySchema = createInsertSchema(claimHistory, {
  claimId: z.number().int().positive(),
  action: z.enum(CLAIM_HISTORY_ACTIONS),
  fromStatus: z.string().min(1),
  toStatus: z.string().min(1),
  userId: z.number().int().positive(),
  userRole: z.string().min(1)
}).omit({
  id: true,
  createdAt: true
})

export const selectClaimHistorySchema = createSelectSchema(claimHistory)

export type ClaimHistory = typeof claimHistory.$inferSelect
export type InsertClaimHistory = z.infer<typeof insertClaimHistorySchema>
