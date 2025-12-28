import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userAuthId: text('user_auth_id').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['ADMIN', 'CS', 'QRCC', 'MANAGEMENT'] }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
})