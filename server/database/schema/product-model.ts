import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'

export const productModel = sqliteTable('product_model', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vendorId: integer('vendor_id').references(() => vendor.id).notNull(),
  modelName: text('model_name').notNull(),
  inch: text('inch').notNull(),
})