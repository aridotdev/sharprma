import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const vendor = sqliteTable('vendor', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
})