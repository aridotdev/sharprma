import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const defect = sqliteTable('defect_master', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('defect_name').notNull().unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
}, table => [
  index('defect_is_active_idx').on(table.isActive)
])

// Zod schemas for validation
export const insertDefectSchema = createInsertSchema(defect, {
  name: z.string().min(1, 'Defect name is required').max(50, 'Defect name must be less than 50 characters').trim(),
  isActive: z.boolean().default(true)
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectDefectSchema = createSelectSchema(defect)

export const updateDefectSchema = insertDefectSchema.partial()

export type SelectDefect = typeof defect.$inferSelect
export type InsertDefect = z.infer<typeof insertDefectSchema>
export type UpdateDefect = z.infer<typeof updateDefectSchema>
