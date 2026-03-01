// server/database/schema/notification-master.ts
import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { vendor } from './vendor'
import { productModel } from './product-model'
import { NOTIFICATION_STATUSES } from '../../../shared/utils/constants'

export const notificationMaster = sqliteTable('notification_master', {
  id: integer().primaryKey({ autoIncrement: true }),
  notificationCode: text().notNull().unique(),
  notificationDate: integer({ mode: 'timestamp_ms' }).notNull(),
  modelId: integer().notNull().references(() => productModel.id, { onDelete: 'restrict' }),
  branch: text().notNull(),
  vendorId: integer().notNull().references(() => vendor.id, { onDelete: 'restrict' }),
  status: text().notNull().$type<typeof NOTIFICATION_STATUSES[number]>(),
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
  uniqueIndex('notification_master_code_idx').on(table.notificationCode),
  index('notification_master_vendor_idx').on(table.vendorId),
  index('notification_master_date_idx').on(table.notificationDate),
  index('notification_master_status_idx').on(table.status),
  index('notification_master_created_at_idx').on(table.createdAt),
  index('notification_master_vendor_status_idx').on(table.vendorId, table.status),
  index('notification_master_vendor_date_idx').on(table.vendorId, table.notificationDate)
])

export const insertNotificationMasterSchema = createInsertSchema(notificationMaster, {
  notificationCode: z.string().min(1, 'Notification code is required').trim(),
  notificationDate: z.number().int('Date must be a timestamp'),
  modelId: z.number().int('Model ID must be an integer').positive('Invalid model ID'),
  branch: z.string().min(1, 'Branch is required').trim(),
  vendorId: z.number().int('Vendor ID must be an integer').positive('Invalid vendor ID'),
  status: z.enum(NOTIFICATION_STATUSES),
  createdBy: z.number().int('Created by must be integer').positive('Invalid number or type'),
  updatedBy: z.number().int('Updated by must be integer').positive('Invalid number or type')
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectNotificationMasterSchema = createSelectSchema(notificationMaster)

export const updateNotificationMasterSchema = insertNotificationMasterSchema.partial().omit({
  createdBy: true,
  notificationCode: true
})

export type NotificationMaster = typeof notificationMaster.$inferSelect
export type InsertNotificationMaster = z.infer<typeof insertNotificationMasterSchema>
export type UpdateNotificationMaster = z.infer<typeof updateNotificationMasterSchema>
