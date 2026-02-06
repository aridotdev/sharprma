// server/database/schema/vendor.ts
import { sql } from 'drizzle-orm'
// import { relations } from 'drizzle-orm'
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
// import { claim } from './claim'
// import { notificationRef } from './notification-ref'
// import { productModel } from './product-model'
// import { vendorPhotoRule } from './vendor-photo-rule'
// import { vendorFieldRule } from './vendor-field-rule'
// import { vendorClaim } from './vendor-claim'

/**
 * VENDOR TABLE
 * Stores vendor master data (MOKA, MTC, SDP)
 * Uses soft delete via isActive flag
 * Reference: 6_db-master.md section 1
 */
export const vendor = sqliteTable('vendor', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
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
})

// Relations
// export const vendorRelations = relations(vendor, ({ many }) => ({
//   // One-to-many: Vendor has many Claims
//   claims: many(claim),

//   // One-to-many: Vendor has many NotificationRefs
//   notificationRefs: many(notificationRef),

//   // One-to-many: Vendor has many ProductModels
//   productModels: many(productModel),

//   // One-to-many: Vendor has many VendorPhotoRules
//   photoRules: many(vendorPhotoRule),

//   // One-to-many: Vendor has many VendorFieldRules
//   fieldRules: many(vendorFieldRule),

//   // One-to-many: Vendor has many VendorClaims
//   vendorClaims: many(vendorClaim)
// }))

// Zod schemas for validation
export const insertVendorSchema = createInsertSchema(vendor, {
  name: z
    .string()
    .min(1, 'Vendor name is required')
    .max(25, 'Vendor name must be less than 25 characters')
    .trim(),
  createdBy: z.number().min(1).max(3).int('Created by must be integer').positive('Invalid number or type'),
  updatedBy: z.number().min(1).max(3).int('Created by must be integer').positive('Invalid number or type')
}).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
})

export const selectVendorSchema = createSelectSchema(vendor)

// Update schema - all fields optional for partial updates
export const updateVendorSchema = insertVendorSchema.partial().omit({
  createdBy: true
})

// update schema - only isActive for soft delete
export const updateVendorStatusSchema = z.object({
  isActive: z.boolean('Must be boolean'),
  updatedBy: z.number().min(1).max(3).int('Created by must be integer').positive('Invalid number or type')
})

// Type exports
export type Vendor = typeof vendor.$inferSelect
export type InsertVendor = z.infer<typeof insertVendorSchema>
export type UpdateVendor = z.infer<typeof updateVendorSchema>
export type UpdateVendorStatus = z.infer<typeof updateVendorStatusSchema>
