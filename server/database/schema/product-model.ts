/* eslint-disable @stylistic/arrow-parens */
import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const productModel = sqliteTable('product_model', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  inch: text().notNull(),
  vendorId: integer().references(() => vendor.id, { onDelete: 'cascade' }).notNull(),
  isActive: integer({ mode: 'boolean' }).notNull().default(true),
  createdAt: integer({ mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().default(new Date())
}, (table) => [
  index('product_model_vendor_idx').on(table.vendorId),
  uniqueIndex('product_model_name_uq').on(table.name)
])

// Zod schemas for validation
export const insertProductModelSchema = createInsertSchema(productModel, {
  name: z.string().min(1, 'Model name is required').max(25, 'Model name must be less than 25 characters').trim(),
  inch: z.string().min(1, 'Inch size is required').max(2, 'Inch size max 2 characters'),
  vendorId: z.number().int().positive('Vendor ID must be a positive integer')
}).omit({
  id: true
})

export const selectProductModelSchema = createSelectSchema(productModel)

export type SelectProductModel = typeof productModel.$inferInsert
export type InsertProductModel = z.infer<typeof insertProductModelSchema>
