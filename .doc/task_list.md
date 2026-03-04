# Task List — RMA Claim System

> Total: 32 task | 8 Phase

---

## Phase 1 — Foundation: Database & Auth

- [x] **#1** Buat schema DB: `ProductModel`, `NotificationMaster`, `DefectMaster`
  - File: `schema/product-model.ts`, `schema/notification-master.ts`, `schema/defect-master.ts`
  - Tambah Zod insert/update schemas, export di `schema/index.ts`

- [x] **#2** Buat schema DB: `Claim`, `ClaimPhoto`, `ClaimHistory`
  - File: `schema/claim.ts`, `schema/claim-photo.ts`, `schema/claim-history.ts`
  - Tambah Zod schemas, export di `schema/index.ts`

- [x] **#3** Buat schema DB: `VendorClaim`, `VendorClaimItem`, `PhotoReview`, `SequenceGenerator`
  - File: `schema/vendor-claim.ts`, `schema/vendor-claim-item.ts`, `schema/photo-review.ts`, `schema/sequence-generator.ts`

- [x] **#4** Buat schema DB: `Profile` & tabel Better-Auth (`user`, `session`, `account`, `verification`)
  - ~~FK `userAuthId TEXT` → `auth.user.id`, relasi two-way~~ *(Refactored: profile dihapus, data bisnis pindah ke `user` via `additionalFields`)*, jalankan `db:migrate`

- [x] **#5** Setup Better-Auth server
  - File: `server/utils/auth.ts`, `app/utils/auth-client.ts`
  - Konfigurasi: session 7 hari, ratelimit, max 5 attempt, lock 15 menit

- [ ] **#6** Buat auth middleware & route protection
  - File: `server/middleware/auth.ts`, `app/middleware/auth.global.ts`, `app/middleware/cs.ts`, `app/middleware/dashboard.ts`
  - Guard: CS → `/cs`, QRCC/Admin/Management → `/dashboard`, unauthorized → redirect

- [/] **#7** Buat halaman Login & Profile
  - `app/pages/login.vue` ✅ — form email + password, redirect sesuai role via `authClient.getSession()`
  - `app/pages/profile.vue` — tampil nama/role/branch (read-only), edit nama & ganti password

---

## Phase 2 — Master Data Management

- [ ] **#8** Buat shared infrastructure
  - `server/utils/error-handler.ts` — centralized error wrapper
  - `server/utils/sequence-generator.ts` — generate `CL-{YYYYMMDD}-{Seq}` & `VC-{YYYYMMDD}-{Seq}`
  - `app/layouts/cs.vue` & `app/layouts/dashboard.vue`
  - `app/components/sidebar/SidebarNav.vue` — menu dinamis per role
  - `app/composables/useAuth.ts` — auth state & role check

- [ ] **#9** Vendor CRUD — Backend
  - `server/repositories/vendor.repo.ts`, `server/services/vendor.service.ts`
  - API: `GET/POST /vendors`, `GET/PUT/PATCH /vendors/:id`

- [ ] **#10** Vendor CRUD — Frontend
  - `app/pages/dashboard/master/vendor.vue`
  - Tabel list, form create/edit, editor JSON `requiredPhotos`/`requiredFields`, toggle active

- [ ] **#11** Product Model CRUD — Backend
  - `server/repositories/product-model.repo.ts`, `server/services/product-model.service.ts`
  - API: `GET/POST /product-models`, `GET/PUT/PATCH /product-models/:id`

- [ ] **#12** Product Model CRUD — Frontend
  - `app/pages/dashboard/master/product-model.vue` — tabel, filter by vendor, form create/edit

- [ ] **#13** Defect Master CRUD — Backend
  - `server/repositories/defect-master.repo.ts`, `server/services/defect-master.service.ts`
  - API: `GET/POST /defect-masters`, `GET/PUT/PATCH /defect-masters/:id`

- [ ] **#14** Defect Master CRUD — Frontend
  - `app/pages/dashboard/master/defect.vue` — tabel, form create/edit, toggle active

- [ ] **#15** Notification Master CRUD — Backend (+ Import Excel)
  - `server/repositories/notification-master.repo.ts`, `server/services/notification-master.service.ts`
  - API: `GET/POST /notification-masters`, `GET/PUT /:id`, `POST /import`
  - Import: parsing Excel (xlsx), validasi, insert/update, return summary

- [ ] **#16** Notification Master CRUD — Frontend (+ Import Excel UI)
  - `app/pages/dashboard/master/notification.vue`
  - Modal upload Excel: drag-drop, preview tabel, highlight error, konfirmasi import
  - Tombol download template Excel

---

## Phase 3 — Claim Flow: CS

- [ ] **#17** CS Dashboard & Claim List — Backend
  - `server/repositories/claim.repo.ts`, `server/services/claim.service.ts`
  - API: `GET /claims` (filter submittedBy, status, tanggal), `GET /claims/:id`

- [ ] **#18** CS Dashboard & Claim List — Frontend
  - `app/pages/cs/index.vue` — hero input notification code + tabel klaim sendiri
  - `app/pages/cs/claim/[id].vue` — detail klaim read-only + tab Claim History

- [ ] **#19** Claim Wizard Create — Backend
  - `GET /notifications/lookup` — lookup notification code
  - `POST /claims` — create draft, `PUT /claims/:id` — update draft
  - `POST /claims/:id/submit` — submit ke QRCC, insert ClaimHistory
  - `POST /claims/:id/photos` — upload foto (validasi MIME, ≤5MB, thumbnail 300×300 via sharp)
  - `DELETE /claims/:id/photos/:photoId`
  - `server/services/photo-upload.service.ts`, `server/repositories/claim-photo.repo.ts`

- [ ] **#20** Claim Wizard Create — Frontend (Multi-Step Form)
  - `app/pages/cs/claim/create.vue` — container wizard + progress bar
  - `app/components/claim/StepNotificationInfo.vue` — Step 1: lookup, auto-fill, serial, defect, conditional fields
  - `app/components/claim/StepPhotoUpload.vue` — Step 2: upload zone per photoType, drag-drop, preview
  - `app/components/claim/StepReviewSubmit.vue` — Step 3: summary + tombol Submit/Draft
  - `app/components/claim/PhotoDropZone.vue` — reusable drag-drop component
  - `app/composables/useClaimWizard.ts` — state management wizard + auto-save

- [ ] **#21** Claim Revision Flow — Backend & Frontend
  - `POST /claims/:id/revision` — submit revision, status → SUBMITTED, insert ClaimHistory
  - `app/pages/cs/claim/[id]/edit.vue` — hanya item rejected yang bisa diedit, highlight merah, tampil QRCC notes
  - `app/components/claim/RevisionHighlight.vue`

---

## Phase 4 — Claim Flow: QRCC

- [ ] **#22** QRCC Claims Dashboard — Backend
  - `GET /dashboard/claims` — list klaim (filter status, vendor, tanggal, branch)
  - `GET /dashboard/claims/:id` — detail + auto-set `IN_REVIEW`, insert ClaimHistory
  - `POST /dashboard/claims/:id/review` — kalkulasi APPROVED/NEED_REVISION, update foto, notifikasi CS

- [ ] **#23** QRCC Claims Dashboard — Frontend (3-Tab Interface)
  - `app/pages/dashboard/claims/index.vue` — list klaim + filter
  - `app/pages/dashboard/claims/[id].vue` — 3 tab: Claim Info, Photo Review, Claim History
  - `app/components/review/ClaimInfoTab.vue`, `PhotoReviewTab.vue`, `PhotoReviewCard.vue`, `ClaimHistoryTab.vue`

- [ ] **#24** Photo Review — Backend (Repository + Service)
  - `server/repositories/photo-review.repo.ts`
  - `server/services/claim-review.service.ts` — kalkulasi status akhir klaim berdasarkan review foto

- [ ] **#25** Audit Trail — Backend & Frontend
  - `GET /dashboard/audit-trail` — list ClaimHistory (filter claimId, userId, action, tanggal)
  - `GET /dashboard/audit-trail/export` — generate Excel
  - `app/pages/dashboard/audit-trail.vue` — tabel + filter + tombol export

---

## Phase 5 — Vendor Claim

- [ ] **#26** Vendor Claim Generate — Backend
  - `server/repositories/vendor-claim.repo.ts`, `server/repositories/vendor-claim-item.repo.ts`
  - `server/services/vendor-claim.service.ts` — seleksi klaim APPROVED, generate `VC-{YYYYMMDD}-{Seq}`, snapshot JSON
  - API: `GET/POST /vendor-claims`, `GET /vendor-claims/:id`, `GET /vendor-claims/:id/export`
  - `server/services/excel-export.service.ts`

- [ ] **#27** Vendor Claim — Frontend (Wizard + Detail)
  - `app/pages/dashboard/vendor-claims/index.vue` — list vendor claims
  - `app/pages/dashboard/vendor-claims/create.vue` — wizard 3 step (pilih vendor → checklist klaim → preview + generate)
  - `app/pages/dashboard/vendor-claims/[id].vue` — tabel items + input keputusan

- [ ] **#28** Vendor Decision Input — Backend & Frontend
  - `PUT /vendor-claims/:id/items/:itemId` — update vendorDecision, compensation, rejectReason; auto-kalkulasi PROCESSING/COMPLETED
  - `server/services/vendor-decision.service.ts`
  - `app/components/vendor-claim/VendorDecisionModal.vue` — modal input ACCEPTED/REJECTED

---

## Phase 6 — Management & Admin

- [ ] **#29** User Management — Backend & Frontend
  - `server/services/user.service.ts`, `server/repositories/user.repo.ts`
  - API: `GET/POST /users`, `PUT /users/:id` (role/branch), `PATCH /users/:id` (toggle active)
  - Create user: buat auth + profile sekaligus, default password `sharp1234`
  - `app/pages/dashboard/users.vue` — tabel user, form tambah, toggle active, ubah role/branch

- [ ] **#30** Dashboard Overview & Statistik
  - `GET /dashboard/stats` — aggregate: total klaim per status, vendor, periode
  - `server/services/dashboard.service.ts`
  - `app/pages/dashboard/index.vue` — chart (@unovis/vue) + widget per role

- [ ] **#31** Reports — Backend & Frontend
  - `GET /reports`, `GET /reports/export` — data laporan + export Excel/PDF
  - `server/services/report.service.ts`
  - `app/pages/dashboard/reports.vue` — filter periode/vendor, charts, tombol export

---

## Phase 7 — Testing & Polish

- [ ] **#32** Unit Tests, Integration Tests & UX Polish
  - Unit tests di `test/unit/` — Zod schemas, service logic, helper functions
  - Integration tests di `test/nuxt/` — API endpoints, auth middleware
  - Loading states & skeleton loaders di semua halaman
  - Toast notification (success/error) konsisten
  - Cek responsive design (desktop & tablet)
  - `npm run test` ✅ | `npm run typecheck` ✅ | `npm run lint` ✅

---

> **Cara baca status:**
> - `[ ]` Belum dikerjakan
> - `[/]` Sedang dikerjakan
> - `[x]` Selesai
