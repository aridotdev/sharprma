// server/utils/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, username } from 'better-auth/plugins'
import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'
import db from '../database'
import * as schema from '../database/schema'

// ============================================================
// RBAC — Custom Access Control untuk Sistem RMA
// ============================================================

const statement = {
  ...defaultStatements,
  claim: ['create', 'submit', 'review', 'approve', 'reject', 'archive'],
  masterData: ['view', 'create', 'update', 'deactivate'],
  report: ['view'],
  auditTrail: ['view'],
  userManagement: ['view', 'create', 'update', 'deactivate']
} as const

const ac = createAccessControl(statement)

/**
 * CS — Customer Service
 * Hanya bisa membuat dan submit claim
 */
const CS = ac.newRole({
  claim: ['create', 'submit']
})

/**
 * QRCC — Quality/Review
 * Bisa review, approve, reject claim + akses master data & laporan
 */
const QRCC = ac.newRole({
  claim: ['create', 'submit', 'review', 'approve', 'reject', 'archive'],
  masterData: ['view', 'create', 'update', 'deactivate'],
  report: ['view'],
  auditTrail: ['view'],
  ...adminAc.statements
})

/**
 * MANAGEMENT
 * Hanya bisa melihat laporan dan audit trail
 */
const MANAGEMENT = ac.newRole({
  report: ['view'],
  auditTrail: ['view']
})

/**
 * ADMIN
 * Akses penuh ke semua fitur termasuk manajemen user
 */
const ADMIN = ac.newRole({
  claim: ['create', 'submit', 'review', 'approve', 'reject', 'archive'],
  masterData: ['view', 'create', 'update', 'deactivate'],
  report: ['view'],
  auditTrail: ['view'],
  userManagement: ['view', 'create', 'update', 'deactivate'],
  ...adminAc.statements
})

// ============================================================
// BETTER-AUTH INSTANCE
// ============================================================

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema
  }),

  /**
   * Email + Password Authentication
   * disableSignUp: true → User hanya bisa dibuat oleh Admin
   */
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8
  },

  /**
   * Session Management
   * Expire: 7 hari, refresh setiap 1 hari
   * cookieCache: agar session tidak di-query DB setiap request
   */
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
    }
  },

  /**
   * Rate Limiting — Login lockout
   * /sign-in/email: max 5 percobaan per 15 menit
   * Referensi konstanta: MAX_FAILED_LOGIN_ATTEMPTS = 5, FAILED_LOGIN_LOCK_MINUTES = 15
   */
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    customRules: {
      '/sign-in/email': {
        window: 60 * 15, // 900 detik = 15 menit
        max: 5
      }
    },
    storage: 'memory'
  },

  plugins: [
    /**
     * Username Plugin — menambahkan field username & displayUsername
     * Schema: user.username (unique), user.displayUsername
     */
    username(),

    /**
     * Admin Plugin — manajemen user dengan custom roles RMA
     * defaultRole: 'CS' (role default saat user baru dibuat Admin)
     * adminRoles: siapa yang dianggap sebagai admin oleh plugin ini
     */
    admin({
      defaultRole: 'CS',
      adminRoles: ['ADMIN', 'QRCC'],
      ac,
      roles: { CS, QRCC, MANAGEMENT, ADMIN }
    })
  ],

  /**
   * Additional Business Fields — dipindahkan dari tabel profile
   * branch: cabang user bekerja
   * isActive: status aktif user (soft delete)
   */
  user: {
    additionalFields: {
      branch: {
        type: 'string',
        required: false,
        input: false
      },
      isActive: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        input: false
      }
    }
  }
})

export type Auth = typeof auth
