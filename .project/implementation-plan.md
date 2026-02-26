# RMA CLAIM SYSTEM — IMPLEMENTATION PLAN

> **Created**: 2026-02-26
> **Last Updated**: 2026-02-26
> **Purpose**: Rencana implementasi end-to-end untuk multi-agent development
> **Source**: Konsolidasi dari semua dokumen `.project/`

---

## Resolved Issues (Previously Inconsistent)

> [!NOTE]
> Semua inconsistensi berikut sudah **diselesaikan** dan disinkronkan pada 2026-02-26:

### ✅ 1. VendorPhotoRule & VendorFieldRule → JSON columns di Vendor

- `vendor.ts`: Ditambahkan kolom `requiredPhotos` (json) dan `requiredFields` (json) + validasi Zod
- `database.ts`: Dihapus references ke `VendorPhotoRule` dan `VendorFieldRule`
- `schema/index.ts`: Dihapus exports `vendor-photo-rule` dan `vendor-field-rule`
- `2_user-and-role-pages.md`: Dihapus halaman `/dashboard/master/vendor-photo-rules` dan `/dashboard/master/vendor-field-rules`
- `4_alur-sistem-qrcc.md`: Dihapus baris master data Vendor Photo Rules & Vendor Field Rules

### ✅ 2. Constants: CANCEL → ARCHIVE

- `constants.ts`: `CLAIM_HISTORY_ACTIONS` sekarang punya `ARCHIVE` (bukan `CANCEL`), sesuai `6_constants.md`
- `CANCEL` tetap hanya ada di `CLAIM_ACTIONS`

### ✅ 3. Vendor schema updated

- `vendor.ts`: Ditambahkan kolom `code` (text, NOT NULL, UNIQUE), `requiredPhotos`, `requiredFields`
- Ditambahkan indexes: `vendor_code_idx`, `vendor_is_active_idx`, `vendor_created_at_idx`

### ✅ 4. Profile (bukan UserRma)

- `database.ts`: Semua references `userRma` → `profile`, type exports `Profile` dan `NewProfile`
- `schema/index.ts`: Comment reference `user-rma` → `profile`
- `NotificationRef` → `NotificationMaster` (konsisten dengan spec.md naming)

### ✅ 5. npm dependencies — sudah terinstall

- Verified di `package.json`: `better-auth`, `date-fns`, `@unovis/vue`, `@unovis/ts`, `xlsx`, `sharp` ✅

### ✅ 6. SequenceGenerator — ditambahkan ke spec.md

- `spec.md`: Ditambahkan Section 3.5.7 SequenceGenerator dengan definisi kolom, index, dan catatan

---

## Current State Assessment

### ✅ Sudah Ada (Bisa Dipakai)
- Nuxt 4 project scaffold (`nuxt.config.ts`, `package.json`)
- Drizzle config (`drizzle.config.ts`)
- Database connection (`server/database/index.ts`)
- Constants & types (`shared/utils/constants.ts`) ✅ synced
- Database type definitions (`shared/types/database.ts`) ✅ synced
- Vendor schema (`server/database/schema/vendor.ts`) ✅ updated
- Vitest config dengan 3 project (unit, nuxt, e2e)
- Basic app shell (`app/app.vue`, `app/pages/index.vue`)
- All npm dependencies installed

### ❌ Belum Ada (Harus Dibuat)
- 10+ database schemas (ProductModel, NotificationMaster, DefectMaster, Claim, ClaimPhoto, VendorClaim, VendorClaimItem, ClaimHistory, PhotoReview, Profile, Auth, SequenceGenerator)
- Database migrations
- Better-Auth integration
- API routes (semua endpoint)
- Service layer (semua business logic)
- Repository layer (semua CRUD operations)
- Auth middleware & route protection
- 18+ frontend pages
- Layout components (sidebar, header)
- Shared composables
- File upload infrastructure
- Excel import/export
- Tests

---

## Proposed Changes

### Phase 1: Foundation — Database & Auth (Week 1)

> Fondasi yang harus selesai sebelum phase lain bisa mulai. Semua agent bergantung pada schema & auth ini.

---

#### 1A. Database Schemas

Implementasi semua Drizzle schema sesuai `spec.md` Section 3.

##### [NEW] `server/database/schema/product-model.ts`
- Schema `productModel` sesuai spec 3.4.2
- FK ke `vendor.id`, FK `createdBy`/`updatedBy` ke `profile.id`
- Indexes: UNIQUE(name, vendorId), INDEX(vendorId), INDEX(isActive), INDEX(createdAt), INDEX(vendorId, isActive)
- Zod insert/update schemas

##### [NEW] `server/database/schema/notification-master.ts`
- Schema `notificationMaster` sesuai spec 3.4.3
- FK ke `productModel.id`, `vendor.id`, `profile.id`
- Indexes: UNIQUE(notificationCode), INDEX(vendorId), INDEX(notificationDate), INDEX(status), INDEX(createdAt), INDEX(vendorId, status), INDEX(vendorId, notificationDate)
- Zod schemas

##### [NEW] `server/database/schema/defect-master.ts`
- Schema `defectMaster` sesuai spec 3.4.4
- Indexes: UNIQUE(name), INDEX(isActive), INDEX(createdAt)
- Zod schemas

##### [NEW] `server/database/schema/claim.ts`
- Schema `claim` sesuai spec 3.5.1
- FK ke `notificationMaster.id`, `productModel.id`, `vendor.id`, `defectMaster.code`, `profile.id`
- Indexes: UNIQUE(claimNumber), INDEX(vendorId), INDEX(claimStatus), INDEX(submittedBy), INDEX(vendorId, claimStatus)
- Zod schemas

##### [NEW] `server/database/schema/claim-photo.ts`
- Schema `claimPhoto` sesuai spec 3.5.2
- FK ke `claim.id`
- Indexes: UNIQUE(claimId, photoType), INDEX(claimId)
- Zod schemas

##### [NEW] `server/database/schema/vendor-claim.ts`
- Schema `vendorClaim` sesuai spec 3.5.3
- FK ke `vendor.id`, `profile.id`
- Zod schemas

##### [NEW] `server/database/schema/vendor-claim-item.ts`
- Schema `vendorClaimItem` sesuai spec 3.5.4
- FK ke `vendorClaim.id` (CASCADE), `claim.id`, `profile.id`
- Zod schemas

##### [NEW] `server/database/schema/claim-history.ts`
- Schema `claimHistory` sesuai spec 3.5.5
- FK ke `claim.id`, `profile.id`
- Indexes: INDEX(claimId), INDEX(userId)
- Zod schemas

##### [NEW] `server/database/schema/photo-review.ts`
- Schema `photoReview` sesuai spec 3.5.6
- FK ke `claimPhoto.id`, `profile.id`
- Indexes: INDEX(claimPhotoId), INDEX(reviewedBy)
- Zod schemas

##### [NEW] `server/database/schema/profile.ts`
- Schema `profile` sesuai spec 3.6.1
- FK `userAuthId` ke Better-Auth `user.id`
- Indexes: UNIQUE(userAuthId), INDEX(role)
- Zod schemas

##### [NEW] `server/database/schema/auth.ts`
- Better-Auth auto-generated tables (user, session, account, verification)
- Konfigurasi sesuai spec 3.6.2

##### [NEW] `server/database/schema/sequence-generator.ts`
- Schema sesuai spec 3.5.7
- Kolom: `id`, `type` (CLAIM/VENDOR_CLAIM), `currentDate` (text YYYYMMDD), `lastSequence` (integer)
- Indexes: UNIQUE(type, currentDate)

##### [MODIFY] [index.ts](file:///home/arsya/sharp/sharprma/server/database/schema/index.ts)
- Uncomment semua exports untuk schema baru

---

#### 1B. Better-Auth Integration

##### [NEW] `server/lib/auth.ts`
- Setup Better-Auth server instance
- Konfigurasi: email/password, username plugin, admin plugin
- Session: expire 7 hari, rate limit, max 5 attempts, lock 15 menit
- Hubungkan ke Drizzle adapter

##### [NEW] `server/api/auth/[...all].ts`
- Catch-all route untuk Better-Auth API handlers

##### [NEW] `app/utils/auth-client.ts`
- Better-Auth client-side instance

##### [NEW] `server/utils/auth-helpers.ts`
- Helper: `requireAuth()`, `requireRole()`, `getCurrentUser()`
- Utility untuk mendapatkan profile dari session

---

#### 1C. Auth Middleware & Route Protection

##### [NEW] `server/middleware/auth.ts`
- Server middleware untuk proteksi API routes

##### [NEW] `app/middleware/auth.global.ts`
- Client-side route guard
- Redirect logic per role (`CS` → `/cs`, others → `/dashboard`)
- Unauthorized → redirect ke home role masing-masing

##### [NEW] `app/middleware/cs.ts`
- Guard khusus `/cs/*` routes → role CS only

##### [NEW] `app/middleware/dashboard.ts`
- Guard `/dashboard/*` → QRCC, Management, Admin
- Sub-guards untuk claims, vendor-claims, master, users

---

#### 1D. Auth Pages & Profile

##### [NEW] `app/pages/login.vue`
- Login form (email + password)
- Post-login redirect sesuai role

##### [NEW] `app/pages/profile.vue`
- View & edit nama
- Ubah password
- Read-only: role, branch

---

### Phase 2: Master Data Management (Week 1–2)

> CRUD backend + frontend untuk semua entitas master. Bisa di-paralel antar master entity.

---

#### Shared Infrastructure (sebelum CRUD)

##### [NEW] `server/utils/error-handler.ts`
- Centralized error handler dengan `createError()`

##### [NEW] `server/utils/sequence-generator.ts`
- Utility untuk generate `CL-{YYYYMMDD}-{Seq}` dan `VC-{YYYYMMDD}-{Seq}`

##### [NEW] `app/layouts/default.vue`
- Layout utama dengan sidebar navigation (role-based)
- Header dengan user info, logout

##### [NEW] `app/layouts/cs.vue`
- Layout khusus CS area

##### [NEW] `app/layouts/dashboard.vue`
- Layout khusus Dashboard area (QRCC/Admin/Management)

##### [NEW] `app/components/sidebar/SidebarNav.vue`
- Sidebar navigation component, menu items per role

##### [NEW] `app/composables/useAuth.ts`
- Composable untuk auth state, user info, role check

---

#### 2A. Vendor CRUD (Agent A)

##### Backend
- [NEW] `server/repositories/vendor.repo.ts` — CRUD + soft delete
- [NEW] `server/services/vendor.service.ts` — Business logic
- [NEW] `server/api/vendors/index.get.ts` — List vendors
- [NEW] `server/api/vendors/index.post.ts` — Create vendor
- [NEW] `server/api/vendors/[id].get.ts` — Get vendor by ID
- [NEW] `server/api/vendors/[id].put.ts` — Update vendor
- [NEW] `server/api/vendors/[id].patch.ts` — Toggle active status

##### Frontend
- [NEW] `app/pages/dashboard/master/vendor.vue` — CRUD table + JSON rules editor UI (requiredPhotos & requiredFields)

---

#### 2B. Product Model CRUD (Agent B)

##### Backend
- [NEW] `server/repositories/product-model.repo.ts`
- [NEW] `server/services/product-model.service.ts`
- [NEW] `server/api/product-models/index.get.ts`
- [NEW] `server/api/product-models/index.post.ts`
- [NEW] `server/api/product-models/[id].get.ts`
- [NEW] `server/api/product-models/[id].put.ts`
- [NEW] `server/api/product-models/[id].patch.ts`

##### Frontend
- [NEW] `app/pages/dashboard/master/product-model.vue`

---

#### 2C. Defect Master CRUD (Agent C)

##### Backend
- [NEW] `server/repositories/defect-master.repo.ts`
- [NEW] `server/services/defect-master.service.ts`
- [NEW] `server/api/defect-masters/index.get.ts`
- [NEW] `server/api/defect-masters/index.post.ts`
- [NEW] `server/api/defect-masters/[id].get.ts`
- [NEW] `server/api/defect-masters/[id].put.ts`
- [NEW] `server/api/defect-masters/[id].patch.ts`

##### Frontend
- [NEW] `app/pages/dashboard/master/defect.vue`

---

#### 2D. Notification Master CRUD + Excel Import (Agent D)

##### Backend
- [NEW] `server/repositories/notification-master.repo.ts`
- [NEW] `server/services/notification-master.service.ts`
- [NEW] `server/api/notification-masters/index.get.ts`
- [NEW] `server/api/notification-masters/index.post.ts`
- [NEW] `server/api/notification-masters/[id].get.ts`
- [NEW] `server/api/notification-masters/[id].put.ts`
- [NEW] `server/api/notification-masters/import.post.ts` — Excel import

##### Frontend
- [NEW] `app/pages/dashboard/master/notification.vue` — CRUD + import Excel UI

---

### Phase 3: Claim Flow — CS (Week 2–3)

> Multi-step wizard, photo upload, dan revision interface. Bergantung pada Phase 1 & 2.

---

#### 3A. CS Dashboard & Claim List

##### Backend
- [NEW] `server/repositories/claim.repo.ts`
- [NEW] `server/services/claim.service.ts`
- [NEW] `server/api/claims/index.get.ts` — List claims (filter by submittedBy, status)
- [NEW] `server/api/claims/[id].get.ts` — Get claim detail

##### Frontend
- [NEW] `app/pages/cs/index.vue` — Hero input notification code + claim list
- [NEW] `app/pages/cs/claim/[id].vue` — Claim detail (read-only + tab ClaimHistory)

---

#### 3B. Claim Wizard (Create)

##### Backend
- [NEW] `server/api/notifications/lookup.get.ts` — Notification code lookup
- [NEW] `server/api/claims/index.post.ts` — Create claim (draft)
- [NEW] `server/api/claims/[id].put.ts` — Update claim draft
- [NEW] `server/api/claims/[id]/submit.post.ts` — Submit claim ke QRCC
- [NEW] `server/api/claims/[id]/photos/index.post.ts` — Upload foto
- [NEW] `server/api/claims/[id]/photos/[photoId].delete.ts` — Delete foto
- [NEW] `server/services/photo-upload.service.ts` — File validation, storage, thumbnail
- [NEW] `server/repositories/claim-photo.repo.ts`
- [NEW] `server/repositories/claim-history.repo.ts`

##### Frontend
- [NEW] `app/pages/cs/claim/create.vue` — Multi-step form wizard (3 steps)
- [NEW] `app/components/claim/StepNotificationInfo.vue` — Step 1
- [NEW] `app/components/claim/StepPhotoUpload.vue` — Step 2
- [NEW] `app/components/claim/StepReviewSubmit.vue` — Step 3
- [NEW] `app/components/claim/PhotoDropZone.vue` — Drag & drop upload component
- [NEW] `app/composables/useClaimWizard.ts` — Wizard state management

---

#### 3C. Claim Revision

##### Backend
- [NEW] `server/api/claims/[id]/revision.post.ts` — Submit revision

##### Frontend
- [NEW] `app/pages/cs/claim/[id]/edit.vue` — Revision mode
- [NEW] `app/components/claim/RevisionHighlight.vue` — Rejected items highlight

---

### Phase 4: Claim Flow — QRCC (Week 3–4)

> Review interface, approve/reject, audit trail. Bergantung pada Phase 3.

---

#### 4A. QRCC Claims Dashboard

##### Backend
- [NEW] `server/api/dashboard/claims/index.get.ts` — List all claims (untuk QRCC/Admin)
- [NEW] `server/api/dashboard/claims/[id].get.ts` — Get claim detail (auto IN_REVIEW)
- [NEW] `server/api/dashboard/claims/[id]/review.post.ts` — Submit review result

##### Frontend
- [NEW] `app/pages/dashboard/claims/index.vue` — Claims list with filters
- [NEW] `app/pages/dashboard/claims/[id].vue` — 3-tab review interface

---

#### 4B. Photo Review Interface

##### Backend
- [NEW] `server/repositories/photo-review.repo.ts`
- [NEW] `server/services/claim-review.service.ts` — Review logic, status calculation

##### Frontend
- [NEW] `app/components/review/PhotoReviewCard.vue`
- [NEW] `app/components/review/ClaimInfoTab.vue`
- [NEW] `app/components/review/PhotoReviewTab.vue`
- [NEW] `app/components/review/ClaimHistoryTab.vue`

---

#### 4C. Audit Trail

##### Backend
- [NEW] `server/api/dashboard/audit-trail/index.get.ts` — List all claim history
- [NEW] `server/api/dashboard/audit-trail/export.get.ts` — Export to Excel

##### Frontend
- [NEW] `app/pages/dashboard/audit-trail.vue`

---

### Phase 5: Vendor Claim (Week 4–5)

> Batch processing claims ke vendor. Bergantung pada Phase 4.

---

#### 5A. Vendor Claim Dashboard & Generation

##### Backend
- [NEW] `server/repositories/vendor-claim.repo.ts`
- [NEW] `server/repositories/vendor-claim-item.repo.ts`
- [NEW] `server/services/vendor-claim.service.ts`
- [NEW] `server/api/vendor-claims/index.get.ts`
- [NEW] `server/api/vendor-claims/index.post.ts` — Generate vendor claim
- [NEW] `server/api/vendor-claims/[id].get.ts`
- [NEW] `server/api/vendor-claims/[id]/export.get.ts` — Generate Excel
- [NEW] `server/services/excel-export.service.ts`

##### Frontend
- [NEW] `app/pages/dashboard/vendor-claims/index.vue`
- [NEW] `app/pages/dashboard/vendor-claims/create.vue` — 3-step wizard
- [NEW] `app/pages/dashboard/vendor-claims/[id].vue` — Detail + input per item

---

#### 5B. Vendor Decision Input

##### Backend
- [NEW] `server/api/vendor-claims/[id]/items/[itemId].put.ts` — Update decision
- [NEW] `server/services/vendor-decision.service.ts`

##### Frontend
- [NEW] `app/components/vendor-claim/VendorDecisionModal.vue`

---

### Phase 6: Management & Admin (Week 5–6)

> Dashboard, reports, user management. Bisa paralel sebagian.

---

#### 6A. User Management (Admin)

##### Backend
- [NEW] `server/services/user.service.ts`
- [NEW] `server/repositories/user.repo.ts`
- [NEW] `server/api/users/index.get.ts`
- [NEW] `server/api/users/index.post.ts` — Create user (auth + profile)
- [NEW] `server/api/users/[id].put.ts` — Update role, branch
- [NEW] `server/api/users/[id].patch.ts` — Toggle active

##### Frontend
- [NEW] `app/pages/dashboard/users.vue`

---

#### 6B. Dashboard Overview

##### Backend
- [NEW] `server/api/dashboard/stats.get.ts` — Aggregate metrics
- [NEW] `server/services/dashboard.service.ts`

##### Frontend
- [NEW] `app/pages/dashboard/index.vue` — Charts & widgets

---

#### 6C. Reports

##### Backend
- [NEW] `server/api/reports/index.get.ts` — Report data
- [NEW] `server/api/reports/export.get.ts` — Export Excel/PDF
- [NEW] `server/services/report.service.ts`

##### Frontend
- [NEW] `app/pages/dashboard/reports.vue` — Charts via @unovis/vue

---

### Phase 7: Testing & Polish (Week 6–7)

---

#### 7A. Unit Tests
- Schema validation tests (Zod)
- Service layer logic tests
- Helper/composable tests
- Location: `test/unit/`

#### 7B. Nuxt Integration Tests
- API endpoint tests
- Auth middleware tests
- Location: `test/nuxt/`

#### 7C. UX Polish
- Loading states, skeleton loaders
- Toast notifications (success/error)
- Responsive design check
- Smooth transitions untuk conditional fields

---

### Phase 8: Demo & Production (Week 7–8)

---

- UAT dengan management
- API documentation (opsional)
- Deployment setup (Nginx, PM2/Docker, CI/CD)
- Seed data untuk demo

---

## Verification Plan

### Automated Tests

```bash
# Unit tests
npm run test:unit

# Nuxt integration tests
npm run test:nuxt

# All tests
npm run test

# Type checking
npm run typecheck

# Lint
npm run lint
```

### Database Verification

```bash
# Generate migrations dari schemas
npm run db:generate

# Apply migrations
npm run db:migrate

# Inspect database via studio
npm run db:studio
```

### Manual Verification

Per phase, verifikasi melalui browser:
1. **Phase 1**: Login → redirect sesuai role, profile page works
2. **Phase 2**: CRUD master data, Excel import notification
3. **Phase 3**: Create claim wizard end-to-end, photo upload, revision flow
4. **Phase 4**: QRCC review flow, approve/reject, audit trail
5. **Phase 5**: Generate vendor claim, input vendor decision
6. **Phase 6**: Dashboard stats, reports, user management
7. **Phase 7**: Run full test suite, check coverage

---

## Multi-Agent Strategy

Setelah Phase 1 selesai (foundation), phase berikutnya bisa dipecah ke multiple agents:

| Agent   | Scope                                        | Depends On  |
| ------- | -------------------------------------------- | ----------- |
| Agent A | Vendor CRUD (Phase 2A)                       | Phase 1     |
| Agent B | Product Model CRUD (Phase 2B)                | Phase 1     |
| Agent C | Defect Master CRUD (Phase 2C)                | Phase 1     |
| Agent D | Notification Master CRUD + import (Phase 2D) | Phase 1     |
| Agent E | CS Claim Flow (Phase 3)                      | Phase 1 + 2 |
| Agent F | QRCC Review Flow (Phase 4)                   | Phase 3     |
| Agent G | Vendor Claim (Phase 5)                       | Phase 4     |
| Agent H | Dashboard/Reports/User Mgmt (Phase 6)        | Phase 1     |
| Agent I | Testing & Polish (Phase 7)                   | Phase 3–6   |

> **Phase 1 adalah blocker** — harus selesai dulu supaya agent lain bisa bekerja paralel.

---

## File Summary

| Category         | New Files | Modified Files                   |
| ---------------- | --------- | -------------------------------- |
| Database Schemas | 11        | 1 (index.ts — uncomment exports) |
| Shared Types     | 0         | 0 (sudah di-sync)                |
| Auth             | 4         | 0                                |
| Middleware       | 4         | 0                                |
| API Routes       | ~40       | 0                                |
| Services         | ~12       | 0                                |
| Repositories     | ~10       | 0                                |
| Pages            | ~18       | 0                                |
| Components       | ~15       | 0                                |
| Composables      | ~3        | 0                                |
| Layouts          | 3         | 0                                |
| **Total**        | **~120**  | **1**                            |
