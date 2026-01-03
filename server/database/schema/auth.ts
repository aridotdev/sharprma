import { relations } from 'drizzle-orm'
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  id: integer().primaryKey({ autoIncrement: true }),
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
    .notNull(),
  username: text().unique(),
  displayUsername: text()
})

export const session = sqliteTable(
  'session',
  {
    id: integer().primaryKey({ autoIncrement: true }),
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
    userId: integer()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
  },
  table => [index('session_userId_idx').on(table.userId)]
)

export const account = sqliteTable(
  'account',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: integer()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: integer(),
    refreshTokenExpiresAt: integer(),
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
    id: integer().primaryKey({ autoIncrement: true }),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: integer().notNull(),
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
