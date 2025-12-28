import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { vendor } from './vendor'
import { user } from './user'

export const claim = sqliteTable('claim', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  claimNumber: text('claim_number').notNull().unique(),
  notification: text('notification').notNull(),
  modelName: text('model_name').notNull(),
  vendorId: integer('vendor_id').references(() => vendor.id).notNull(),
  inch: text('inch').notNull(),
  branch: text('branch').notNull(),
  odfNumber: text('odf_number'),
  panelSerialNo: text('panel_serial_no').notNull(),
  ocSerialNo: text('oc_serial_no').notNull(),
  defect: text('defect').notNull(),
  version: text('version'),
  week: text('week'),
  claimStatus: text('claim_status', { 
    enum: ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'NEED_REVISION', 'APPROVED', 'CANCELLED'] 
  }).notNull().default('DRAFT'),
  submittedBy: integer('submitted_by').references(() => user.id),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
})