# GitHub Issues — RMA Claim System

> Generated from `.project/implementation-plan.md`
> Template: `.github/PULL_REQUEST_TEMPLATE.md`
> Total Issues: 32

---

## 🏗️ PHASE 1 — Foundation: Database & Auth

---

### Issue #1 — [Feat] Database Schemas: Product Model, Notification Master, Defect Master

**Labels**: `feat`, `backend`, `phase-1`, `database`
**Milestone**: Phase 1 — Foundation

---

## 📝 Deskripsi
Implementasi Drizzle ORM schema untuk tiga tabel master: `productModel`, `notificationMaster`, dan `defectMaster` sesuai `spec.md` Section 3.4.

## 🔗 Related Issue
Tidak ada (issue awal)

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/database/schema/product-model.ts` — FK ke `vendor.id`, `profile.id`, indexes
- [ ] Buat `server/database/schema/notification-master.ts` — FK ke `productModel`, `vendor`, `profile`, indexes
- [ ] Buat `server/database/schema/defect-master.ts` — indexes UNIQUE(name), INDEX(isActive)
- [ ] Tambahkan Zod insert/update schemas di setiap file
- [ ] Export semua schema di `server/database/schema/index.ts`

## 🧪 Checklist Pengujian
- [ ] 🧩 `npm run db:generate` berhasil tanpa error
- [ ] 🛡️ Validasi data (Zod) sudah mencakup semua case

---

### Issue #2 — [Feat] Database Schemas: Claim, ClaimPhoto, ClaimHistory

**Labels**: `feat`, `backend`, `phase-1`, `database`
**Milestone**: Phase 1 — Foundation

---

## 📝 Deskripsi
Implementasi Drizzle schema untuk tabel transaksi klaim sesuai `spec.md` Section 3.5.1–3.5.2 dan 3.5.5.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/database/schema/claim.ts` — FK ke notificationMaster, productModel, vendor, profile; Indexes UNIQUE(claimNumber)
- [ ] Buat `server/database/schema/claim-photo.ts` — FK ke claim.id; Index UNIQUE(claimId, photoType)
- [ ] Buat `server/database/schema/claim-history.ts` — FK ke claim.id, profile.id; Indexes (claimId, userId)
- [ ] Tambahkan Zod schemas di setiap file
- [ ] Export semua schema di `index.ts`

## 🧪 Checklist Pengujian
- [ ] 🧩 `npm run db:generate` berhasil tanpa error
- [ ] 🛡️ Zod enum validation sesuai `spec.md` CLAIM_STATUSES dan PHOTO_TYPES

---

### Issue #3 — [Feat] Database Schemas: VendorClaim, VendorClaimItem, PhotoReview, SequenceGenerator

**Labels**: `feat`, `backend`, `phase-1`, `database`
**Milestone**: Phase 1 — Foundation

---

## 📝 Deskripsi
Implementasi Drizzle schema untuk tabel vendor claim dan pendukungnya sesuai `spec.md` Section 3.5.3–3.5.7.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/database/schema/vendor-claim.ts` — FK ke vendor.id, profile.id
- [ ] Buat `server/database/schema/vendor-claim-item.ts` — FK ke vendorClaim.id (CASCADE), claim.id, profile.id
- [ ] Buat `server/database/schema/photo-review.ts` — FK ke claimPhoto.id, profile.id; Indexes (claimPhotoId, reviewedBy)
- [ ] Buat `server/database/schema/sequence-generator.ts` — UNIQUE(type, currentDate)
- [ ] Export semua schema di `index.ts`

## 🧪 Checklist Pengujian
- [ ] 🧩 `npm run db:generate` berhasil tanpa error
- [ ] 🛡️ Zod enum VENDOR_DECISIONS, SEQUENCE_TYPES sesuai `6_constants.md`

---

### Issue #4 — [Feat] Database Schemas: Profile & Auth (Better-Auth Tables)

**Labels**: `feat`, `backend`, `phase-1`, `database`, `auth`
**Milestone**: Phase 1 — Foundation

---

## 📝 Deskripsi
Implementasi schema `profile` (data bisnis) dan tabel Better-Auth (`user`, `session`, `account`, `verification`) sesuai `spec.md` Section 3.6 dan `7_user-auth-integration.md`.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/database/schema/profile.ts` — FK `userAuthId TEXT` ke Better-Auth user.id, `onDelete: 'restrict'`; Indexes UNIQUE(userAuthId), INDEX(role)
- [ ] Buat `server/database/schema/auth.ts` — Tabel Better-Auth: user, session, account, verification dengan Unix timestamps
- [ ] Tambahkan relasi two-way (`auth` di profile, `profile` di auth user)
- [ ] Tambahkan Zod schemas, export di `index.ts`
- [ ] Jalankan `npm run db:migrate`

## 🧪 Checklist Pengujian
- [ ] 🧩 `npm run db:migrate` berhasil
- [ ] 🧩 `npm run db:studio` — semua tabel muncul dengan relasi yang benar

---

### Issue #5 — [Feat] Better-Auth Server Integration

**Labels**: `feat`, `backend`, `phase-1`, `auth`
**Milestone**: Phase 1 — Foundation

---

## 📝 Deskripsi
Setup Better-Auth server instance dengan konfigurasi email/password, username plugin, admin plugin, session management, dan Drizzle adapter.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/lib/auth.ts` — instance Better-Auth, konfigurasi email/password, session expire 7 hari, rate limit, max 5 attempt, lock 15 menit
- [ ] Buat `server/api/auth/[...all].ts` — catch-all route
- [ ] Buat `app/utils/auth-client.ts` — Better-Auth client-side instance
- [ ] Buat `server/utils/auth-helpers.ts` — `requireAuth()`, `requireRole()`, `getCurrentUser()`

## 🧪 Checklist Pengujian
- [ ] 🧩 POST `/api/auth/sign-in/email` berhasil login
- [ ] 🧩 Session valid setelah login, expired setelah 7 hari
- [ ] 🛡️ Rate limit aktif setelah 5 gagal login

---

### Issue #6 — [Feat] Auth Middleware & Route Protection

**Labels**: `feat`, `backend`, `frontend`, `phase-1`, `auth`
**Milestone**: Phase 1 — Foundation

---

## 📝 Deskripsi
Implementasi server middleware dan Nuxt client-side route guard untuk proteksi rute sesuai RBAC di `2_user-and-role-pages.md`.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/middleware/auth.ts` — proteksi seluruh API routes
- [ ] Buat `app/middleware/auth.global.ts` — redirect CS → `/cs`, others → `/dashboard`, unauthorized → home role
- [ ] Buat `app/middleware/cs.ts` — guard `/cs/*` hanya role CS
- [ ] Buat `app/middleware/dashboard.ts` — guard `/dashboard/*`, sub-guard untuk claims, vendor-claims, master, users

## 🧪 Checklist Pengujian
- [ ] 🧩 CS tidak bisa akses `/dashboard/*` — redirect ke `/cs`
- [ ] 🧩 Admin bisa akses semua rute termasuk `/dashboard/users`
- [ ] 🧩 Tanpa session → redirect ke `/login`

---

### Issue #7 — [Feat] Halaman Login & Profile

**Labels**: `feat`, `frontend`, `phase-1`, `auth`
**Milestone**: Phase 1 — Foundation

---

## 📝 Deskripsi
Implementasi halaman login (email + password) dan halaman profile (view/edit nama, ganti password) sesuai spesifikasi.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `app/pages/login.vue` — form email + password, post-login redirect sesuai role, tampilkan error jika gagal
- [ ] Buat `app/pages/profile.vue` — tampilkan nama, role, branch (read-only), tombol edit nama & ganti password

## 🧪 Checklist Pengujian
- [ ] 🧩 Login berhasil → redirect sesuai role (CS → /cs, QRCC → /dashboard)
- [ ] 🧩 Login email/password salah → tampilkan pesan error
- [ ] 💅 UI menggunakan NuxtUI components

---

---

## 📋 PHASE 2 — Master Data Management

---

### Issue #8 — [Feat] Shared Infrastructure: Layouts, Error Handler, Sequence Generator

**Labels**: `feat`, `backend`, `frontend`, `phase-2`, `infrastructure`
**Milestone**: Phase 2 — Master Data

---

## 📝 Deskripsi
Infrastruktur bersama yang harus ada sebelum CRUD Master Data: layouts, sidebar, composable auth, error handler, dan utility sequence generator.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/utils/error-handler.ts` — centralized `createError()` wrapper
- [ ] Buat `server/utils/sequence-generator.ts` — generate `CL-{YYYYMMDD}-{Seq}` dan `VC-{YYYYMMDD}-{Seq}`
- [ ] Buat `app/layouts/cs.vue` dan `app/layouts/dashboard.vue`
- [ ] Buat `app/components/sidebar/SidebarNav.vue` — menu items dinamis per role
- [ ] Buat `app/composables/useAuth.ts` — auth state, user info, role check

## 🧪 Checklist Pengujian
- [ ] 🧩 Sequence menghasilkan nomor yang unik per tanggal
- [ ] 💅 Sidebar menampilkan menu sesuai role aktif

---

### Issue #9 — [Feat] Vendor CRUD — Backend (API + Service + Repository)

**Labels**: `feat`, `backend`, `phase-2`, `master-data`
**Milestone**: Phase 2 — Master Data

---

## 📝 Deskripsi
Implementasi layer backend untuk fitur CRUD Vendor: repository, service, dan API routes.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/repositories/vendor.repo.ts` — CRUD + soft delete (toggle `isActive`)
- [ ] Buat `server/services/vendor.service.ts` — business logic: validasi duplikat code, validasi JSON requiredPhotos/requiredFields
- [ ] Buat `server/api/vendors/index.get.ts` — list vendors (filter isActive)
- [ ] Buat `server/api/vendors/index.post.ts` — create vendor, validasi Zod
- [ ] Buat `server/api/vendors/[id].get.ts` — get vendor by ID
- [ ] Buat `server/api/vendors/[id].put.ts` — update vendor
- [ ] Buat `server/api/vendors/[id].patch.ts` — toggle active status

## 🧪 Checklist Pengujian
- [ ] 🧩 GET `/api/vendors` mengembalikan list
- [ ] 🛡️ POST dengan `code` duplikat → 409 error
- [ ] 🛡️ PATCH toggle isActive berhasil

---

### Issue #10 — [Feat] Vendor CRUD — Frontend (Halaman Master Vendor)

**Labels**: `feat`, `frontend`, `phase-2`, `master-data`
**Milestone**: Phase 2 — Master Data

---

## 📝 Deskripsi
Implementasi halaman frontend untuk manajemen Vendor dengan tabel CRUD, editor JSON untuk `requiredPhotos` dan `requiredFields`, serta toggle active/inactive.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `app/pages/dashboard/master/vendor.vue` — tabel list vendor, tombol tambah/edit/toggle active
- [ ] Form create/edit vendor dengan editor JSON untuk `requiredPhotos` dan `requiredFields`
- [ ] Integrasi dengan API `/api/vendors`

## 🧪 Checklist Pengujian
- [ ] 🧩 Create, edit, dan toggle vendor berjalan end-to-end
- [ ] 💅 Editor JSON user-friendly (tidak plain text)
- [ ] 🛡️ Validasi client-side sebelum submit

---

### Issue #11 — [Feat] Product Model CRUD — Backend

**Labels**: `feat`, `backend`, `phase-2`, `master-data`
**Milestone**: Phase 2 — Master Data

---

## 📝 Deskripsi
Backend CRUD untuk entitas Product Model.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/repositories/product-model.repo.ts`
- [ ] Buat `server/services/product-model.service.ts`
- [ ] Buat API routes: `GET /product-models`, `POST`, `GET /:id`, `PUT /:id`, `PATCH /:id`

## 🧪 Checklist Pengujian
- [ ] 🧩 UNIQUE constraint (name, vendorId) ter-handle dengan baik → 409 jika duplikat
- [ ] 🛡️ Zod validasi di setiap route

---

### Issue #12 — [Feat] Product Model CRUD — Frontend

**Labels**: `feat`, `frontend`, `phase-2`, `master-data`
**Milestone**: Phase 2 — Master Data

---

## 📝 Deskripsi
Halaman frontend untuk Product Model dengan filter by vendor.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `app/pages/dashboard/master/product-model.vue` — tabel, filter by vendor, form create/edit

## 🧪 Checklist Pengujian
- [ ] 💅 Filter by vendor berjalan
- [ ] 🧩 CRUD end-to-end berhasil

---

### Issue #13 — [Feat] Defect Master CRUD — Backend

**Labels**: `feat`, `backend`, `phase-2`, `master-data`
**Milestone**: Phase 2 — Master Data

---

## 📝 Deskripsi
Backend CRUD untuk Defect Master.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/repositories/defect-master.repo.ts`
- [ ] Buat `server/services/defect-master.service.ts`
- [ ] Buat API routes: `GET /defect-masters`, `POST`, `GET /:id`, `PUT /:id`, `PATCH /:id` (toggle active)

## 🧪 Checklist Pengujian
- [ ] 🛡️ Zod validation di semua routes
- [ ] 🧩 Toggle active/inactive berhasil

---

### Issue #14 — [Feat] Defect Master CRUD — Frontend

**Labels**: `feat`, `frontend`, `phase-2`, `master-data`
**Milestone**: Phase 2 — Master Data

---

## 📝 Deskripsi
Halaman frontend untuk Defect Master.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `app/pages/dashboard/master/defect.vue` — tabel defect, form create/edit, toggle active

## 🧪 Checklist Pengujian
- [ ] 💅 UI sesuai dengan design system NuxtUI
- [ ] 🧩 CRUD end-to-end berhasil

---

### Issue #15 — [Feat] Notification Master CRUD — Backend (termasuk Excel Import)

**Labels**: `feat`, `backend`, `phase-2`, `master-data`
**Milestone**: Phase 2 — Master Data

---

## 📝 Deskripsi
Backend CRUD untuk Notification Master beserta fitur import dari file Excel sesuai alur di `4_alur-sistem-qrcc.md`.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/repositories/notification-master.repo.ts`
- [ ] Buat `server/services/notification-master.service.ts`
- [ ] Buat API routes: `GET /notification-masters`, `POST`, `GET /:id`, `PUT /:id`
- [ ] Buat `server/api/notification-masters/import.post.ts` — parsing Excel (xlsx), preview data, insert/update, return summary

## 🧪 Checklist Pengujian
- [ ] 🧩 Import Excel → berhasil insert data baru
- [ ] 🧩 Import dengan baris error → laporan "X berhasil, Y gagal"
- [ ] 🛡️ Validasi kolom Excel sesuai template (notificationCode, notificationDate, dll)

---

### Issue #16 — [Feat] Notification Master CRUD — Frontend (termasuk Import Excel UI)

**Labels**: `feat`, `frontend`, `phase-2`, `master-data`
**Milestone**: Phase 2 — Master Data

---

## 📝 Deskripsi
Halaman frontend Notification Master dengan fitur import Excel, preview data, dan download template.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `app/pages/dashboard/master/notification.vue` — tabel CRUD + tombol import Excel
- [ ] Implementasi modal/drawer upload Excel: area drag-drop upload, preview tabel parsing, highlight baris error, tombol konfirmasi
- [ ] Tombol download template Excel

## 🧪 Checklist Pengujian
- [ ] 🧩 Upload Excel valid → tampilkan preview, konfirmasi → insert berhasil
- [ ] 🧩 Upload Excel invalid → muncul highlight error per baris
- [ ] 💅 UI menggunakan NuxtUI

---

---

## 📋 PHASE 3 — Claim Flow: CS

---

### Issue #17 — [Feat] CS Dashboard & Claim List — Backend

**Labels**: `feat`, `backend`, `phase-3`, `claim`
**Milestone**: Phase 3 — CS Claim Flow

---

## 📝 Deskripsi
Backend untuk dashboard CS: repository, service, dan API list claim milik CS dengan filter status dan tanggal.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/repositories/claim.repo.ts` — CRUD claim
- [ ] Buat `server/services/claim.service.ts` — business logic klaim
- [ ] Buat `server/api/claims/index.get.ts` — list claims (filter submittedBy, status, tanggal)
- [ ] Buat `server/api/claims/[id].get.ts` — get claim detail beserta foto dan history

## 🧪 Checklist Pengujian
- [ ] 🧩 CS hanya bisa melihat klaim miliknya sendiri
- [ ] 🛡️ API terlindungi auth middleware

---

### Issue #18 — [Feat] CS Dashboard & Claim List — Frontend

**Labels**: `feat`, `frontend`, `phase-3`, `claim`
**Milestone**: Phase 3 — CS Claim Flow

---

## 📝 Deskripsi
Halaman CS index dengan hero input notification code dan daftar klaim milik CS.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `app/pages/cs/index.vue` — hero section input notification code, tabel daftar klaim sendiri, filter status/tanggal
- [ ] Buat `app/pages/cs/claim/[id].vue` — detail klaim (read-only) dengan tab Claim History

## 🧪 Checklist Pengujian
- [ ] 🧩 Input notification code → redirect ke `/cs/claim/create?notification=<code>`
- [ ] 🧩 Tabel klaim menampilkan data dengan filter yang berfungsi
- [ ] 💅 UI sesuai design system

---

### Issue #19 — [Feat] Claim Wizard Create — Backend (API + Photo Upload)

**Labels**: `feat`, `backend`, `phase-3`, `claim`, `upload`
**Milestone**: Phase 3 — CS Claim Flow

---

## 📝 Deskripsi
Backend untuk proses pembuatan klaim baru: lookup notifikasi, create draft, update draft, submit, foto upload, dan claim history.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/api/notifications/lookup.get.ts` — lookup notification code
- [ ] Buat `server/api/claims/index.post.ts` — create claim draft
- [ ] Buat `server/api/claims/[id].put.ts` — update claim draft
- [ ] Buat `server/api/claims/[id]/submit.post.ts` — submit ke QRCC, update status → SUBMITTED, insert ClaimHistory
- [ ] Buat `server/api/claims/[id]/photos/index.post.ts` — upload foto (validasi MIME, max 5MB, simpan, generate thumbnail 300x300 via sharp)
- [ ] Buat `server/api/claims/[id]/photos/[photoId].delete.ts` — delete foto
- [ ] Buat `server/services/photo-upload.service.ts` — file validation, storage (`./public/uploads/claims/`), thumbnail
- [ ] Buat `server/repositories/claim-photo.repo.ts`, `server/repositories/claim-history.repo.ts`

## 🧪 Checklist Pengujian
- [ ] 🧩 Upload foto valid → file tersimpan + thumbnail terbentuk
- [ ] 🛡️ Upload file > 5MB atau bukan JPG/PNG → error 400
- [ ] 🛡️ Path traversal prevention aktif
- [ ] 🧩 Submit klaim → status berubah ke SUBMITTED, ClaimHistory tercatat

---

### Issue #20 — [Feat] Claim Wizard Create — Frontend (Multi-Step Form)

**Labels**: `feat`, `frontend`, `phase-3`, `claim`
**Milestone**: Phase 3 — CS Claim Flow

---

## 📝 Deskripsi
Implementasi multi-step form wizard 3 langkah untuk CS membuat klaim baru.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `app/pages/cs/claim/create.vue` — container wizard dengan progress bar
- [ ] Buat `app/components/claim/StepNotificationInfo.vue` — Step 1: lookup notifikasi, auto-fill data, serial number, defect, conditional vendor fields
- [ ] Buat `app/components/claim/StepPhotoUpload.vue` — Step 2: upload zone per photoType berdasarkan vendor, drag & drop, preview, delete
- [ ] Buat `app/components/claim/StepReviewSubmit.vue` — Step 3: summary semua data, tombol Submit/Draft
- [ ] Buat `app/components/claim/PhotoDropZone.vue` — reusable drag & drop upload component
- [ ] Buat `app/composables/useClaimWizard.ts` — state management wizard, auto-save

## 🧪 Checklist Pengujian
- [ ] 🧩 Lookup notifikasi ditemukan → data auto-fill read-only
- [ ] 🧩 Lookup tidak ditemukan → form manual, auto-generate saat submit
- [ ] 🧩 Tombol Next disabled sampai semua field valid
- [ ] 🧩 Auto-save di tiap step berhasil
- [ ] 💅 Drag & drop upload berfungsi di Chrome dan Firefox

---

### Issue #21 — [Feat] Claim Revision Flow — Backend & Frontend

**Labels**: `feat`, `backend`, `frontend`, `phase-3`, `claim`
**Milestone**: Phase 3 — CS Claim Flow

---

## 📝 Deskripsi
Implementasi alur revisi klaim: CS menerima notifikasi NEED_REVISION, membuka edit mode, memperbaiki item yang di-reject, dan submit ulang.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/api/claims/[id]/revision.post.ts` — submit revision, update status ke SUBMITTED, insert ClaimHistory
- [ ] Buat `app/pages/cs/claim/[id]/edit.vue` — revision mode: hanya item rejected yang bisa diedit, highlight merah, QRCC notes ditampilkan
- [ ] Buat `app/components/claim/RevisionHighlight.vue` — komponen highlight foto/field yang di-reject

## 🧪 Checklist Pengujian
- [ ] 🧩 Edit mode hanya muncul saat status `NEED_REVISION`
- [ ] 🧩 Item yangsudah direvisi berubah jadi hijau
- [ ] 🧩 Submit Revision berhasil → status kembali ke SUBMITTED

---

---

## 📋 PHASE 4 — Claim Flow: QRCC

---

### Issue #22 — [Feat] QRCC Claims Dashboard — Backend

**Labels**: `feat`, `backend`, `phase-4`, `claim`, `review`
**Milestone**: Phase 4 — QRCC Review

---

## 📝 Deskripsi
Backend untuk QRCC mereview klaim: list klaim, auto-set status IN_REVIEW saat dibuka, dan submit hasil review.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/api/dashboard/claims/index.get.ts` — list semua klaim (filter status, vendor, tanggal, branch)
- [ ] Buat `server/api/dashboard/claims/[id].get.ts` — get detail, auto-set status → IN_REVIEW, insert ClaimHistory(START_REVIEW)
- [ ] Buat `server/api/dashboard/claims/[id]/review.post.ts` — submit review result: kalkulasi APPROVED vs NEED_REVISION, update foto status, insert ClaimHistory, notifikasi CS

## 🧪 Checklist Pengujian
- [ ] 🧩 Buka detail klaim SUBMITTED → status otomatis IN_REVIEW
- [ ] 🧩 Review dengan semua foto VERIFIED → status klaim APPROVED
- [ ] 🧩 Review dengan 1+ foto REJECT → status klaim NEED_REVISION

---

### Issue #23 — [Feat] QRCC Claims Dashboard — Frontend (3-Tab Review Interface)

**Labels**: `feat`, `frontend`, `phase-4`, `claim`, `review`
**Milestone**: Phase 4 — QRCC Review

---

## 📝 Deskripsi
Halaman QRCC untuk review klaim dengan tiga tab: Claim Info (editable), Photo Review, dan Claim History.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `app/pages/dashboard/claims/index.vue` — list claims dengan filter status/vendor/tanggal
- [ ] Buat `app/pages/dashboard/claims/[id].vue` — 3-tab layout: Claim Info, Photo Review, Claim History
- [ ] Buat `app/components/review/ClaimInfoTab.vue` — field read-only + editable
- [ ] Buat `app/components/review/PhotoReviewCard.vue` — preview foto full-size, tombol VERIFIED/REJECT, form alasan
- [ ] Buat `app/components/review/PhotoReviewTab.vue` — list semua foto dengan progress indicator
- [ ] Buat `app/components/review/ClaimHistoryTab.vue` — audit trail read-only per klaim

## 🧪 Checklist Pengujian
- [ ] 🧩 QRCC bisa edit serial number di Claim Info tab
- [ ] 🧩 Tombol "Selesai Review" disabled sampai semua foto direview
- [ ] 🧩 Submit review berhasil → redirect ke list claims

---

### Issue #24 — [Feat] Photo Review Backend (Repository + Service)

**Labels**: `feat`, `backend`, `phase-4`, `review`
**Milestone**: Phase 4 — QRCC Review

---

## 📝 Deskripsi
Backend service dan repository untuk menyimpan hasil review foto per klaim.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/repositories/photo-review.repo.ts`
- [ ] Buat `server/services/claim-review.service.ts` — logika kalkulasi status akhir klaim berdasarkan hasil review foto

## 🧪 Checklist Pengujian
- [ ] 🧩 Record PhotoReview tersimpan dengan field reviewedBy, status, rejectReason, reviewedAt
- [ ] 🛡️ `rejectReason` wajib jika status REJECT

---

### Issue #25 — [Feat] Audit Trail Dashboard — Backend & Frontend

**Labels**: `feat`, `backend`, `frontend`, `phase-4`, `audit`
**Milestone**: Phase 4 — QRCC Review

---

## 📝 Deskripsi
Halaman Audit Trail yang menampilkan semua ClaimHistory lintas klaim dengan filter dan fitur export ke Excel.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/api/dashboard/audit-trail/index.get.ts` — list all ClaimHistory (filter claimId, userId, action, tanggal)
- [ ] Buat `server/api/dashboard/audit-trail/export.get.ts` — generate file Excel
- [ ] Buat `app/pages/dashboard/audit-trail.vue` — tabel audit trail dengan filter dan tombol export Excel

## 🧪 Checklist Pengujian
- [ ] 🧩 Filter audit trail berdasarkan action, user, tanggal berjalan
- [ ] 🧩 Export Excel berhasil didownload

---

---

## 📋 PHASE 5 — Vendor Claim

---

### Issue #26 — [Feat] Vendor Claim Generation — Backend

**Labels**: `feat`, `backend`, `phase-5`, `vendor-claim`
**Milestone**: Phase 5 — Vendor Claim

---

## 📝 Deskripsi
Backend untuk generate Vendor Claim dari klaim APPROVED: create VendorClaim record, VendorClaimItem records, dan export Excel.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/repositories/vendor-claim.repo.ts`, `server/repositories/vendor-claim-item.repo.ts`
- [ ] Buat `server/services/vendor-claim.service.ts` — logika seleksi klaim APPROVED yang belum di-vendor-claim, generate `VC-{YYYYMMDD}-{Seq}`, create snapshot JSON
- [ ] Buat `server/api/vendor-claims/index.get.ts` — list vendor claims (filter vendor, status)
- [ ] Buat `server/api/vendor-claims/index.post.ts` — generate vendor claim (batch process)
- [ ] Buat `server/api/vendor-claims/[id].get.ts` — detail vendor claim + items
- [ ] Buat `server/api/vendor-claims/[id]/export.get.ts` — generate file Excel
- [ ] Buat `server/services/excel-export.service.ts`

## 🧪 Checklist Pengujian
- [ ] 🧩 Generate Vendor Claim → record VendorClaim + VendorClaimItem tersimpan
- [ ] 🧩 Klaim APPROVED yang sudah masuk VendorClaim tidak tampil di list pilihan
- [ ] 🧩 Export Excel berhasil didownload dengan data klaim + link foto

---

### Issue #27 — [Feat] Vendor Claim — Frontend (Wizard + Detail)

**Labels**: `feat`, `frontend`, `phase-5`, `vendor-claim`
**Milestone**: Phase 5 — Vendor Claim

---

## 📝 Deskripsi
Frontend untuk seluruh alur Vendor Claim: list, wizard generate (3 step), dan halaman detail untuk input keputusan vendor.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `app/pages/dashboard/vendor-claims/index.vue` — list vendor claims
- [ ] Buat `app/pages/dashboard/vendor-claims/create.vue` — wizard 3 step (pilih vendor + filter, checklist klaim, preview + generate)
- [ ] Buat `app/pages/dashboard/vendor-claims/[id].vue` — tabel items + input keputusan per item

## 🧪 Checklist Pengujian
- [ ] 🧩 Wizard step 2: minimal 1 klaim harus dipilih untuk lanjut
- [ ] 🧩 Generate → redirect ke halaman detail VC
- [ ] 🧩 Export Excel didownload otomatis saat generate

---

### Issue #28 — [Feat] Vendor Decision Input — Backend & Frontend

**Labels**: `feat`, `backend`, `frontend`, `phase-5`, `vendor-claim`
**Milestone**: Phase 5 — Vendor Claim

---

## 📝 Deskripsi
Fitur input keputusan vendor per item klaim (ACCEPTED/REJECTED) dengan kalkulasi otomatis status VendorClaim.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/api/vendor-claims/[id]/items/[itemId].put.ts` — update vendorDecision, compensation, rejectReason; kalkulasi auto status VendorClaim (PROCESSING/COMPLETED)
- [ ] Buat `server/services/vendor-decision.service.ts`
- [ ] Buat `app/components/vendor-claim/VendorDecisionModal.vue` — modal input keputusan ACCEPTED/REJECTED

## 🧪 Checklist Pengujian
- [ ] 🛡️ `rejectReason` wajib jika REJECTED
- [ ] 🧩 Status VendorClaim otomatis berubah ke COMPLETED jika semua item sudah diisi

---

---

## 📋 PHASE 6 — Management & Admin

---

### Issue #29 — [Feat] User Management — Backend & Frontend

**Labels**: `feat`, `backend`, `frontend`, `phase-6`, `admin`
**Milestone**: Phase 6 — Management & Admin

---

## 📝 Deskripsi
Fitur admin untuk membuat, mengubah role/branch, dan toggle active user.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/services/user.service.ts`, `server/repositories/user.repo.ts`
- [ ] Buat `server/api/users/index.get.ts` — list users
- [ ] Buat `server/api/users/index.post.ts` — create user (create auth + profile sekaligus, default password `sharp1234`)
- [ ] Buat `server/api/users/[id].put.ts` — update role, branch
- [ ] Buat `server/api/users/[id].patch.ts` — toggle isActive
- [ ] Buat `app/pages/dashboard/users.vue` — tabel user, form tambah user, toggle active, ubah role/branch

## 🧪 Checklist Pengujian
- [ ] 🧩 Create user baru → bisa login dengan password default
- [ ] 🧩 Toggle inactive → user tidak bisa login
- [ ] 🛡️ Endpoint ini hanya bisa diakses Admin

---

### Issue #30 — [Feat] Dashboard Overview & Statistik

**Labels**: `feat`, `backend`, `frontend`, `phase-6`
**Milestone**: Phase 6 — Management & Admin

---

## 📝 Deskripsi
Halaman dashboard utama dengan statistik dan widget ringkasan yang berbeda per role (QRCC, Management, Admin).

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/api/dashboard/stats.get.ts` — aggregate metrics: total klaim per status, per vendor, per periode
- [ ] Buat `server/services/dashboard.service.ts`
- [ ] Buat `app/pages/dashboard/index.vue` — chart (@unovis/vue) dan widget statistik per role

## 🧪 Checklist Pengujian
- [ ] 🧩 Data statistik sesuai dengan data di database
- [ ] 💅 Chart tampil dengan baik di desktop

---

### Issue #31 — [Feat] Reports — Backend & Frontend

**Labels**: `feat`, `backend`, `frontend`, `phase-6`, `reports`
**Milestone**: Phase 6 — Management & Admin

---

## 📝 Deskripsi
Halaman laporan analytics: klaim per periode, per vendor, kompensasi dari vendor, dengan export Excel/PDF.

## 🛠️ Jenis Perubahan
- [x] ✨ Feat (Fitur baru)

## 📝 Technical Task
- [ ] Buat `server/api/reports/index.get.ts` — data laporan dengan filter
- [ ] Buat `server/api/reports/export.get.ts` — generate Excel/PDF laporan
- [ ] Buat `server/services/report.service.ts`
- [ ] Buat `app/pages/dashboard/reports.vue` — filter periode/vendor, charts @unovis/vue, tombol export

## 🧪 Checklist Pengujian
- [ ] 🧩 Filter laporan berdasarkan periode dan vendor berjalan
- [ ] 🧩 Export Excel berhasil

---

---

## 📋 PHASE 7 & 8 — Testing, Polish & Deployment

---

### Issue #32 — [Feat] Unit Tests, Integration Tests & UX Polish

**Labels**: `testing`, `phase-7`
**Milestone**: Phase 7 — Testing & Polish

---

## 📝 Deskripsi
Penulisan unit test (Zod schema, service layer), integration test (API endpoints, middleware), dan polish UX (loading states, toast, responsive).

## 🛠️ Jenis Perubahan
- [x] 🧪 Testing (test)
- [x] 🧹 Refactor (Pembersihan/Restrukturisasi kode)

## 📝 Technical Task
- [ ] Tulis unit tests di `test/unit/` — Zod schemas, service logic, helper functions
- [ ] Tulis integration tests di `test/nuxt/` — API endpoint, auth middleware
- [ ] Tambahkan loading states & skeleton loaders di semua halaman
- [ ] Implementasi toast notification (success/error) secara konsisten
- [ ] Cek responsive design di desktop & tablet
- [ ] Smooth transitions untuk conditional fields di wizard

## 🧪 Checklist Pengujian
- [ ] 🧩 `npm run test` — semua test pass
- [ ] 🧩 `npm run typecheck` — 0 error
- [ ] 🧩 `npm run lint` — 0 warning/error
- [ ] 💅 Tampilan konsisten di semua resolusi yang ditargetkan
