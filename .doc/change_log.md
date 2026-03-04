# Change Log — RMA Claim System

---

## [2026-03-04] — Auth Schema Refactor: User sebagai Source of Truth

### 🔄 Perubahan Utama

Tabel `profile` dihapus. Semua data bisnis user (role, branch, isActive) dipindahkan langsung ke tabel `user` Better-Auth menggunakan fitur `additionalFields` dan Admin plugin custom roles.

### ✅ File Baru

| File | Keterangan |
|------|-----------|
| `server/utils/auth.ts` | Better-Auth server instance (email/pass, session, rate limit, custom RBAC, additionalFields) |
| `app/utils/auth-client.ts` | Better-Auth client (username + admin plugins) |

### 🔧 File Dimodifikasi

| File | Perubahan |
|------|-----------|
| `server/database/schema/auth.ts` | + field `branch` (text) & `isActive` (boolean) pada tabel `user`; tambah `updateUserStatusSchema` & `updateUserBusinessSchema`; hapus relasi ke `profile` |
| `server/database/schema/claim.ts` | `submittedBy` & `updatedBy`: `integer` → `text` (UUID), update Zod |
| `server/database/schema/claim-history.ts` | `userId`: `integer` → `text` (UUID), update Zod |
| `server/database/schema/product-model.ts` | `createdBy` & `updatedBy`: `integer` → `text` (UUID), update Zod |
| `server/database/schema/index.ts` | Hapus `export * from './profile'` |
| `app/pages/login.vue` | Ganti `useFetch('/api/profile')` → `authClient.getSession()` untuk redirect berbasis role |

### 🗑️ File Dihapus

- `server/database/schema/profile.ts`

### ⚙️ Better-Auth Config

```
emailAndPassword:  enabled, disableSignUp: true, minPassword: 8
session:           expiresIn: 7 hari, updateAge: 1 hari, cookieCache: 5 menit
rateLimit:         /sign-in/email → max 5 percobaan / 15 menit
plugins:           username(), admin() dengan roles CS / QRCC / MANAGEMENT / ADMIN
user.additionalFields: branch (text), isActive (boolean, default: true)
```

### ✅ Verifikasi

- `npx nuxi typecheck` → exit code 0, tidak ada TypeScript error

### 📌 Next Steps

1. Jalankan migrasi DB: `npm run db:generate && npm run db:migrate`
2. Buat Nuxt route handler: `server/routes/auth/[...all].ts`
3. Buat Nuxt middleware proteksi route
