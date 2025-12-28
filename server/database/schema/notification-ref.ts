import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'

export const notificationRef = sqliteTable('notification_ref', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  notificationCode: text('notification_code').notNull().unique(),
  modelName: text('model_name').notNull(),
  vendorId: integer('vendor_id').references(() => vendor.id).notNull(),
  status: text('status', { enum: ['NEW', 'USED', 'EXPIRED'] }).notNull().default('NEW'),
  createdBy: integer('created_by').notNull(),
})