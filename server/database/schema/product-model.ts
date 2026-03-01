// server/database/schema/product-model.ts
import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { vendor } from './vendor'

// Profile is needed as a foreign key for createdBy/updatedBy
// Since it's created in a later issue, we'll assume integer type for now
// and can import it properly later or just leave as integer.
// Based on spec, createdBy references profile.id (integer).

export const productModel = sqliteTable('product_model', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  inch: integer().notNull(),
  vendorId: integer().notNull().references(() => vendor.id, { onDelete: 'restrict' }),
  isActive: integer({ mode: 'boolean' }).notNull().default(true),
  createdBy: integer().notNull(),
  updatedBy: integer().notNull(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
    .$onUpdateFn(() => new Date())
}, table => [
  uniqueIndex('product_model_name_vendor_idx').on(table.name, table.vendorId),
  index('product_model_vendor_idx').on(table.vendorId),
  index('product_model_is_active_idx').on(table.isActive),
  index('product_model_created_at_idx').on(table.createdAt),
  index('product_model_vendor_is_active_idx').on(table.vendorId, table.isActive)
])

export const insertProductModelSchema = createInsertSchema(productModel, {
  name: z.string().min(1, 'Model name is required').trim(),
  inch: z.number().int().positive('Size must be positive'),
  vendorId: z.number().int('Vendor ID must be an integer').positive('Invalid vendor ID'),
  createdBy: z.number().int('Created by must be integer').positive('Invalid number or type'),
  updatedBy: z.number().int('Updated by must be integer').positive('Invalid number or type')
}).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
})

export const selectProductModelSchema = createSelectSchema(productModel)

export const updateProductModelSchema = insertProductModelSchema.partial().omit({
  createdBy: true
})

export const updateProductModelStatusSchema = z.object({
  isActive: z.boolean({ message: 'Must be boolean' }),
  updatedBy: z.number().int('Updated by must be integer').positive('Invalid number or type')
})

export type ProductModel = typeof productModel.$inferSelect
export type InsertProductModel = z.infer<typeof insertProductModelSchema>
export type UpdateProductModel = z.infer<typeof updateProductModelSchema>
export type UpdateProductModelStatus = z.infer<typeof updateProductModelStatusSchema>
