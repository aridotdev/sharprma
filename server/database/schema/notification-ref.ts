/* eslint-disable @stylistic/arrow-parens */
import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'
import { userRma } from './user-rma'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { NOTIFICATION_STATUSES } from '../../../shared/utils/constant'

export const notificationRef = sqliteTable('notification_ref', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  notificationCode: text('notification_code').notNull().unique(),
  modelName: text('model_name').notNull(),
  vendorId: integer('vendor_id').references(() => vendor.id, { onDelete: 'restrict' }).notNull(),
  status: text('status').notNull().default('NEW'),
  createdBy: integer('created_by').references(() => userRma.id).notNull()
}, table => [
  uniqueIndex('notification_ref_code_uq').on(table.notificationCode),
  index('notification_ref_vendor_idx').on(table.vendorId),
  index('notification_ref_status_idx').on(table.status)
])

// Zod schemas for validation
export const insertNotificationRefSchema = createInsertSchema(notificationRef, {
  notificationCode: z.string().min(1, 'Notification code is required').max(25, 'Notification code must be less than 25 characters').trim().toUpperCase(),
  modelName: z.string().min(1, 'Model name is required').max(25, 'Model name must be less than 25 characters').trim(),
  vendorId: z.number().int().positive('Vendor ID must be a positive integer'),
  status: z.enum(NOTIFICATION_STATUSES).default('NEW'),
  createdBy: z.number().int().positive('Created by user ID must be a positive integer')
}).omit({
  id: true
})

export const selectNotificationRefSchema = createSelectSchema(notificationRef)

export type SelectNotificationRef = typeof notificationRef.$inferSelect
export type InsertNotificationRef = z.infer<typeof insertNotificationRefSchema>
