import { sqliteTable, integer, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { FIELD_NAMES } from '../../../shared/utils/constant'

export const vendorFieldRule = sqliteTable('vendor_field_rule', {
  id: integer().primaryKey({ autoIncrement: true }),
  vendorId: integer().references(() => vendor.id, { onDelete: 'cascade' }).notNull(),
  fieldName: text().notNull(),
  isRequired: integer({ mode: 'boolean' }).notNull().default(false),
  createdAt: integer({ mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().default(new Date())
}, (table) => [
  uniqueIndex('vendor_field_rule_vendor_field_name_idx').on(table.vendorId, table.fieldName),
  index('vendor_field_rule_vendor_idx').on(table.vendorId)
])

// Zod schemas for validation
export const insertVendorFieldRuleSchema = createInsertSchema(vendorFieldRule, {
  vendorId: z.number().int().positive('Vendor ID must be a positive integer'),
  fieldName: z.enum(FIELD_NAMES, {
    message: 'Field name must be one of: odfNumber, version, week'
  }),
  isRequired: z.boolean().default(false)
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const selectVendorFieldRuleSchema = createSelectSchema(vendorFieldRule)

export type SelectVendorFieldRule = typeof vendorFieldRule.$inferSelect
export type InsertVendorFieldRule = z.infer<typeof insertVendorFieldRuleSchema>
