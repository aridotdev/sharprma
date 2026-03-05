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

## [2026-03-05] — Implementasi Auth Middleware & Route Protection (Task #6)

### 🔄 Perubahan Utama

Mengimplementasikan proteksi rute berbasis role menggunakan Nuxt Middleware dan mounting API handler Better-Auth untuk memproses endpoint auth.

### ✅ File Baru

| File | Keterangan |
|------|-----------|
| `server/api/auth/[...all].ts` | Mounting Better-Auth handler agar endpoint sign-in/sign-out/get-session dapat digunakan |
| `app/middleware/auth.global.ts` | Global auth guard: cek session dan redirect ke `/login` jika belum login |
| `app/middleware/cs.ts` | Named middleware: Guard untuk rute `/cs/*` (hanya role CS) |
| `app/middleware/dashboard.ts` | Named middleware: Guard untuk rute `/dashboard/*` (hanya role QRCC, Management, Admin) |

### 🔧 File Dimodifikasi

| File | Perubahan |
|------|-----------|
| `server/utils/auth-helpers.ts` | Fix bug: menghapus referensi ke tabel `profile` yang sudah dihapus. Sekarang `requireRole` membaca `user.role` dan `user.isActive` langsung dari Better-Auth session (`session.user`). |
| `app/pages/login.vue` | Menyelaraskan config `definePageMeta` dengan logic redirect dari global middleware yang baru. |
| `.doc/task_list.md` | Menandai Task #6 sebagai selesai [x] |

### ✅ Verifikasi

- `npm run typecheck` → exit code 0, tidak ada TypeScript error
- Middleware logic berjalan di client-side (skip on server menggunakan `import.meta.server`) untuk menghindari bug hydration Nuxt SSR pada `authClient.getSession()`.

### 📌 Next Steps

Melanjutkan implementasi UI Frontend:
- Task #7: Halaman Profile (`app/pages/profile.vue`)

---

## [2026-03-05] — Inisialisasi Seed Accounts

### 🔄 Perubahan Utama

Membuat skrip seeding otomatis `server/scripts/seed.ts` untuk memfasilitasi pembuatan akun testing/dummy sesuai role yang telah ditentukan di sistem RMA (ADMIN, MANAGEMENT, QRCC, CS).

### ✅ File Baru

| File | Keterangan |
|------|-----------|
| `server/scripts/seed.ts` | Skrip menggunakan Better Auth API (`auth.api.createUser`) untuk men-generate 4 user seed. |

### 🔧 File Dimodifikasi

| File | Perubahan |
|------|-----------|
| `package.json` | Menambahkan custom script `db:seed`: `tsx server/scripts/seed.ts` |

### ✅ Akun Tersedia

| Email | Password | Role | Branch |
|-------|----------|------|--------|
| admin@sharp.com | `sharp1234` | ADMIN | HQ |
| management@sharp.com | `sharp1234` | MANAGEMENT | HQ |
| qrcc@sharp.com | `sharp1234` | QRCC | HQ |
| cs@sharp.com | `sharp1234` | CS | Jakarta |

### ✅ Verifikasi

- Skrip dieksekusi menggunakan `npm run db:seed`.
- Berhasil digenerate 4 user langsung ke dalam database yang terhubung dengan kredensial Better-Auth.

---

## [2026-03-05] — Fix TypeScript Error pada Seed Script

### 🔄 Perubahan Utama

Memperbaiki error `unexpected any` pada blok `catch` di eksekusi seeding dummy accounts.

### 🔧 File Dimodifikasi

| File | Perubahan |
|------|-----------|
| `server/scripts/seed.ts` | Menghapus explicit `any` pada parameter `error` di `catch` dan menambahkan type narrowing agar passing lint check `@typescript-eslint/no-explicit-any`. |

### ✅ Verifikasi

- `npm run lint` / typecheck berjalan tanpa error `@typescript-eslint/no-explicit-any`.
