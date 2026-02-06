/**
 * Database Connection - Drizzle ORM + SQLite
 *
 * Source: .project/FINAL_SPECIFICATION.md Section 2.1, 4.1
 */

import { drizzle } from 'drizzle-orm/libsql'
import 'dotenv/config'
import * as schema from './schema'

// You can specify any property from the libsql connection options
const db = drizzle({ connection: { url: process.env.DB_FILE_NAME! || 'file:local.db' }, schema })

export type db = typeof db
export default db
