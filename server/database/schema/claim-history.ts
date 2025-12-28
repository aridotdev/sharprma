import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { claim } from './claim'
import { user } from './user'

export const claimHistory = sqliteTable('claim_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  claimId: integer('claim_id').references(() => claim.id).notNull(),
  action: text('action').notNull(),
  fromStatus: text('from_status').notNull(),
  toStatus: text('to_status').notNull(),
  userId: integer('user_id').references(() => user.id).notNull(),
  userRole: text('user_role').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
})