import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const vendor = sqliteTable('vendor', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true)
})

// Zod schemas for validation
export const insertVendorSchema = createInsertSchema(vendor, {
  name: z.string().min(1, 'Vendor name is required').max(25, 'Vendor name must be less than 25 characters').trim(),
  isActive: z.boolean().default(true)
}).omit({
  id: true,
})

export const selectVendorSchema = createSelectSchema(vendor)

export type SelectVendor = typeof vendor.$inferSelect
export type InsertVendor = z.infer<typeof insertVendorSchema>
