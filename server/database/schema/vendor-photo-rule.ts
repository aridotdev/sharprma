import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'

export const vendorPhotoRule = sqliteTable('vendor_photo_rule', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vendorId: integer('vendor_id').references(() => vendor.id).notNull(),
  photoType: text('photo_type', { 
    enum: ['CLAIM', 'CLAIM_ZOOM', 'ODF', 'PANEL_SN', 'WO_PANEL', 'WO_PANEL_SN'] 
  }).notNull(),
  isRequired: integer('is_required', { mode: 'boolean' }).notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
})