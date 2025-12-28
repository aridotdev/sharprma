import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'

export const vendorFieldRule = sqliteTable('vendor_field_rule', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vendorId: integer('vendor_id').references(() => vendor.id).notNull(),
  fieldName: text('field_name', { enum: ['odfNumber', 'version', 'week'] }).notNull(),
  isRequired: integer('is_required', { mode: 'boolean' }).notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
})