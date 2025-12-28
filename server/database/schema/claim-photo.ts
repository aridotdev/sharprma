import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { claim } from './claim'

export const claimPhoto = sqliteTable('claim_photo', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  claimId: integer('claim_id').references(() => claim.id).notNull(),
  photoType: text('photo_type', { 
    enum: ['CLAIM', 'CLAIM_ZOOM', 'ODF', 'PANEL_SN', 'WO_PANEL', 'WO_PANEL_SN'] 
  }).notNull(),
  filePath: text('file_path').notNull(),
  status: text('status', { enum: ['PENDING', 'VERIFIED', 'REJECT'] }).notNull().default('PENDING'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
})