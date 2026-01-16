import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { PHOTO_TYPES } from '../../../shared/utils/constant'

export const vendorPhotoRule = sqliteTable('vendor_photo_rule', {
  id: integer().primaryKey({ autoIncrement: true }),
  vendorId: integer().references(() => vendor.id).notNull(),
  photoType: text().notNull(),
  isRequired: integer({ mode: 'boolean' }).notNull().default(true),
  createdAt: integer({ mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().default(new Date())
}, (table) => [
  uniqueIndex('vendor_photo_rule_vendor_photo_type_idx').on(table.vendorId, table.photoType),
  index('vendor_photo_rule_vendor_idx').on(table.vendorId)
])

// Zod schemas for validation
export const insertVendorPhotoRuleSchema = createInsertSchema(vendorPhotoRule, {
  vendorId: z.number().int().positive('Vendor ID must be a positive integer'),
  photoType: z.enum(PHOTO_TYPES, {
    message: 'Photo type must be one of: CLAIM, CLAIM_ZOOM, ODF, PANEL_SN, WO_PANEL, WO_PANEL_SN'
  }),
  isRequired: z.boolean().default(true)
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectVendorPhotoRuleSchema = createSelectSchema(vendorPhotoRule)

export type SelectVendorPhotoRule = typeof vendorPhotoRule.$inferSelect
export type InsertVendorPhotoRule = z.infer<typeof insertVendorPhotoRuleSchema>
