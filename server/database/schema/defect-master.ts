// server/database/schema/defect-master.ts
import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const defectMaster = sqliteTable('defect_master', {
  id: integer().primaryKey({ autoIncrement: true }),
  code: text().notNull().unique(),
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
}, table => [
  uniqueIndex('defect_master_name_idx').on(table.name),
  uniqueIndex('defect_master_code_idx').on(table.code),
  index('defect_master_is_active_idx').on(table.isActive),
  index('defect_master_created_at_idx').on(table.createdAt)
])

export const insertDefectMasterSchema = createInsertSchema(defectMaster, {
  code: z.string().min(1, 'Defect code is required').trim(),
  name: z.string().min(1, 'Defect name is required').trim(),
  createdBy: z.number().int('Created by must be integer').positive('Invalid number or type'),
  updatedBy: z.number().int('Updated by must be integer').positive('Invalid number or type')
}).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
})

export const selectDefectMasterSchema = createSelectSchema(defectMaster)

export const updateDefectMasterSchema = insertDefectMasterSchema.partial().omit({
  createdBy: true
})

export const updateDefectMasterStatusSchema = z.object({
  isActive: z.boolean({ message: 'Must be boolean' }),
  updatedBy: z.number().int('Updated by must be integer').positive('Invalid number or type')
})

export type DefectMaster = typeof defectMaster.$inferSelect
export type InsertDefectMaster = z.infer<typeof insertDefectMasterSchema>
export type UpdateDefectMaster = z.infer<typeof updateDefectMasterSchema>
export type UpdateDefectMasterStatus = z.infer<typeof updateDefectMasterStatusSchema>
