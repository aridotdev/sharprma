import { relations } from 'drizzle-orm'
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: integer({ mode: 'boolean' })
    .default(false)
    .notNull(),
  image: text(),
  createdAt: text()
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  updatedAt: text()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdate(() => new Date().toISOString())
    .notNull()
})

export const session = sqliteTable(
  'session',
  {
    id: text().primaryKey(),
    expiresAt: integer({ mode: 'timestamp_ms' }).notNull(),
    token: text().notNull().unique(),
    createdAt: text()
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
    updatedAt: text()
      .$onUpdate(() => new Date().toISOString())
      .notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
  },
  table => [index('session_userId_idx').on(table.userId)]
)

export const account = sqliteTable(
  'account',
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: integer({
      mode: 'timestamp_ms'
    }),
    refreshTokenExpiresAt: integer({
      mode: 'timestamp_ms'
    }),
    scope: text(),
    password: text(),
    createdAt: text()
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
    updatedAt: text()
      .$onUpdate(() => new Date().toISOString())
      .notNull()
  },
  table => [index('account_userId_idx').on(table.userId)]
)

export const verification = sqliteTable(
  'verification',
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: integer({ mode: 'timestamp_ms' }).notNull(),
    createdAt: text()
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
    updatedAt: text()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdate(() => new Date().toISOString())
      .notNull()
  },
  table => [index('verification_identifier_idx').on(table.identifier)]
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account)
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id]
  })
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id]
  })
}))
