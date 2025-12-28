import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core'
import { claim } from './claim'
import { user } from './user'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { CLAIM_HISTORY_ACTIONS, CLAIM_STATUSES, USER_ROLES } from '../../../shared/utils/constant'



export const claimHistory = sqliteTable('claim_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  claimId: integer('claim_id').references(() => claim.id, { onDelete: 'cascade' }).notNull(),
  action: text('action').notNull(),
  fromStatus: text('from_status').notNull(),
  toStatus: text('to_status').notNull(),
  userId: integer('user_id').references(() => user.id).notNull(),
  userRole: text('user_role').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull()
}, (table) => [
  index('claim_history_claim_idx').on(table.claimId),
  index('claim_history_user_idx').on(table.userId),
  index('claim_history_action_idx').on(table.action)
])

// Zod schemas for validation
export const insertClaimHistorySchema = createInsertSchema(claimHistory, {
  claimId: z.number().int().positive('Claim ID must be a positive integer'),
  action: z.enum(CLAIM_HISTORY_ACTIONS, {
    message: `Action must be one of: ${CLAIM_HISTORY_ACTIONS.join(', ')}`
  }),
  fromStatus: z.enum(CLAIM_STATUSES, {
    message: 'From status must be one of: DRAFT, SUBMITTED, IN_REVIEW, NEED_REVISION, APPROVED, CANCELLED'
  }),
  toStatus: z.enum(CLAIM_STATUSES, {
    message: 'To status must be one of: DRAFT, SUBMITTED, IN_REVIEW, NEED_REVISION, APPROVED, CANCELLED'
  }),
  userId: z.number().int().positive('User ID must be a positive integer'),
  userRole: z.enum(USER_ROLES, {
    message: 'User role must be one of: ADMIN, CS, QRCC, MANAGEMENT'
  }),
  note: z.string().max(1000, 'Note must be less than 1000 characters').trim().optional()
}).omit({
  id: true,
  createdAt: true
})

export const selectClaimHistorySchema = createSelectSchema(claimHistory)

export type SelectClaimHistory = typeof claimHistory.$inferSelect
export type InsertClaimHistory = z.infer<typeof insertClaimHistorySchema>
