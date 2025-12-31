import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { USER_ROLES } from '../../../shared/utils/constant'

export const userRma = sqliteTable('user_rma', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userAuthId: text('user_auth_id').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull()
  // eslint-disable-next-line @stylistic/arrow-parens
}, (table) => [
  uniqueIndex('user_auth_id_idx').on(table.userAuthId),
  index('user_role_idx').on(table.role)
])

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(userRma, {
  userAuthId: z.string().min(1, 'User auth ID is required').max(50, 'User auth ID must be less than 50 characters').trim(),
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters').trim(),
  role: z.enum(USER_ROLES, {
    message: 'Role must be one of: ADMIN, CS, QRCC, MANAGEMENT'
  }),
  isActive: z.boolean().default(true)
}).omit({
  id: true,
  createdAt: true
})

export const selectUserSchema = createSelectSchema(userRma)

export type SelectUser = typeof userRma.$inferSelect
export type InsertUser = z.infer<typeof insertUserSchema>
