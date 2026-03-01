// server/database/schema/profile.ts
import { sql, relations } from 'drizzle-orm'
import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { user } from './auth'
import { USER_ROLES } from '../../../shared/utils/constants'

export const profile = sqliteTable('profile', {
  id: integer().primaryKey({ autoIncrement: true }),
  userAuthId: text().notNull().unique().references(() => user.id, { onDelete: 'restrict' }), // Link to Better-Auth user
  name: text().notNull(),
  role: text().notNull().$type<typeof USER_ROLES[number]>(),
  branch: text(),
  isActive: integer({ mode: 'boolean' }).notNull().default(true),
  createdAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => new Date())
}, table => [
  uniqueIndex('profile_user_auth_id_idx').on(table.userAuthId),
  index('profile_role_idx').on(table.role),
  index('profile_branch_idx').on(table.branch)
])

export const profileRelations = relations(profile, ({ one }) => ({
  authUser: one(user, {
    fields: [profile.userAuthId],
    references: [user.id]
  })
}))

export const insertProfileSchema = createInsertSchema(profile, {
  userAuthId: z.string().min(1, 'Auth user ID is required'),
  name: z.string().min(1, 'Profile name is required').trim(),
  role: z.enum(USER_ROLES),
  branch: z.string().optional()
}).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
})

export const selectProfileSchema = createSelectSchema(profile)

export const updateProfileSchema = insertProfileSchema.partial()

export const updateProfileStatusSchema = z.object({
  isActive: z.boolean({ message: 'Must be boolean' })
})

export type Profile = typeof profile.$inferSelect
export type InsertProfile = z.infer<typeof insertProfileSchema>
export type UpdateProfile = z.infer<typeof updateProfileSchema>
export type UpdateProfileStatus = z.infer<typeof updateProfileStatusSchema>
