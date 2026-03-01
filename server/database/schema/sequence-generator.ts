// server/database/schema/sequence-generator.ts
import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { SEQUENCE_TYPES } from '../../../shared/utils/constants'

export const sequenceGenerator = sqliteTable('sequence_generator', {
  id: integer().primaryKey({ autoIncrement: true }),
  type: text().notNull().$type<typeof SEQUENCE_TYPES[number]>(),
  currentDate: text().notNull(), // Format YYYYMMDD
  lastSequence: integer().notNull().default(0)
}, table => [
  uniqueIndex('sequence_generator_type_date_idx').on(table.type, table.currentDate)
])

export const insertSequenceGeneratorSchema = createInsertSchema(sequenceGenerator, {
  type: z.enum(SEQUENCE_TYPES),
  currentDate: z.string().length(8),
  lastSequence: z.number().int().nonnegative().default(0)
}).omit({
  id: true
})

export const selectSequenceGeneratorSchema = createSelectSchema(sequenceGenerator)

export type SequenceGenerator = typeof sequenceGenerator.$inferSelect
export type InsertSequenceGenerator = z.infer<typeof insertSequenceGeneratorSchema>
