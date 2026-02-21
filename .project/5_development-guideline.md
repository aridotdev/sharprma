# DEVELOPMENT GUIDELINES

> **Status**: FINALIZED & LOCKED ✅  
> **Last Update**: 2026-02-21  
> **Purpose**: Panduan teknis dan daftar tugas (Task List) konkret untuk development

---

## 1. Git Workflow

```
Main branch: main
Feature branch: feature/feature-name
Bugfix branch: bugfix/bug-name

Commit message format:
- feat: Add feature X
- fix: Fix bug Y
- docs: Update documentation
- refactor: Refactor module Z
- test: Add test for X
```

---

## 2. Development Phases & Task List

> Berikan tanda checklist `[x]` pada task yang sudah selesai.

### Phase 1: Database & Auth (Week 1)
**Fokus:** Fondasi database, schema, authentication, dan otorisasi dasar.

- [ ] **DB Setup**: Implementasi schema Drizzle berdasarkan `spec.md` (Vendor, ProductModel, NotificationMaster, DefectMaster, Claim, ClaimPhoto, VendorClaim, VendorClaimItem, ClaimHistory, PhotoReview, Profile)
- [ ] **DB Setup**: Generate & apply migrations
- [ ] **Auth Setup**: Integrasi Better-Auth dengan email/password, username, & admin plugin
- [ ] **Auth Feature**: Login endpoint & halaman `/login`
- [ ] **Auth Feature**: Middleware proteksi route berdasarkan role (CS vs QRCC/Admin/Management)
- [ ] **Profile Feature**: Halaman `/profile` (view/edit nama, ubah password)

---

### Phase 2: Master Data Management (Week 1-2)
**Fokus:** CRUD untuk semua entitas master data yang diakses QRCC & Admin di `/dashboard/master/*`.

- [ ] **Vendor**: CRUD table vendor (dengan soft delete `isActive`, manajemen `code`, dan UI editor untuk _JSON rules_ `requiredPhotos` & `requiredFields`)
- [ ] **Product Model**: CRUD table product model (relasi ke vendor)
- [ ] **Defect Master**: CRUD table defect (dengan soft delete `isActive`, dan manajemen `code`)
- [ ] **Notification Master**: CRUD table notification (manual input)
- [ ] **Notification Master**: Fitur Import Excel (parse, validasi preview, bulk insert)

---

### Phase 3: Claim Flow - CS (Week 2-3)
**Fokus:** Entry point CS, multi-step form wizard, photo upload, dan dashboard CS.

- [ ] **CS Dashboard**: Halaman `/cs` dengan input notification code
- [ ] **CS Dashboard**: Tabel daftar klaim milik CS (filter status, tanggal)
- [ ] **Claim Wizard (Step 1)**: Halaman `/cs/claim/create`, integrasi lookup notification (jika tdk ada -> CS input manual)
- [ ] **Claim Wizard (Step 1)**: Form Claim Info dengan _conditional fields_ berdasarkan _JSON rules_ `requiredFields` dari vendor
- [ ] **Claim Wizard (Step 2)**: UI Drag & drop upload foto (berdasarkan _JSON rules_ `requiredPhotos` dari vendor)
- [ ] **Claim Wizard (Step 2)**: API Upload foto (validasi format, size, auto-generate thumbnail, sanitize filename)
- [ ] **Claim Wizard (Backend)**: API Backend _auto-generate_ baris baru di `NotificationMaster` jika CS submit klaim dari kode manual
- [ ] **Claim Wizard (Step 3)**: Review summary page & logic submit ke QRCC (`SUBMITTED`)
- [ ] **Claim Revision**: Halaman `/cs/claim/:id/edit` (mode UI khusus untuk field/foto yang `REJECTED`)
- [ ] **Claim Detail**: Halaman `/cs/claim/:id` (read-only mode + tab Claim History)

---

### Phase 4: Claim Flow - QRCC (Week 3-4)
**Fokus:** Review klaim oleh QRCC, reject/approve logic, dan audit trail.

- [ ] **QRCC Dashboard**: Halaman `/dashboard/claims` (list klaim, filter status/vendor/tanggal)
- [ ] **Review Interface**: Halaman `/dashboard/claims/:id` dengan layout 3 Tab
- [ ] **Review Logic**: Tab 1 (Claim Info) memungkinkan edit 6 field khusus (`panelSerialNo`, `ocSerialNo`, `defect`, dll)
- [ ] **Review Logic**: Tab 2 (Photo Review) tombol VERIFIED/REJECT + wajib isi catatan
- [ ] **Review Logic**: Kalkulasi auto status submit (jika ada reject → `NEED_REVISION`, jika semua verified → `APPROVED`)
- [ ] **Audit Trail**: Automasi insert record `ClaimHistory` & `PhotoReview` saat re-kalkulasi status
- [ ] **Audit Trail**: Halaman khusus `/dashboard/audit-trail` untuk view semua riwayat lintas klaim (beserta Excel export)
- [ ] **Notifications**: Sistem in-app alert/badge untuk CS jika klaimnya berstatus `NEED_REVISION`

---

### Phase 5: Vendor Claim (Week 4-5)
**Fokus:** Batch/export klaim ke vendor dan input keputusan vendor.

- [ ] **Vendor Claim Dashboard**: Halaman `/dashboard/vendor-claims` (list batch)
- [ ] **Generate Wizard (Step 1 & 2)**: Halaman `/dashboard/vendor-claims/create` (Pilih vendor, filter klaim APPROVED, checklist)
- [ ] **Generate Wizard (Step 3)**: Preview data dan Trigger generate
- [ ] **Generate API**: Logic pembuatan `VendorClaim`, `VendorClaimItem`, dan generate Excel file (termasuk photo path)
- [ ] **Vendor Decision**: Halaman `/dashboard/vendor-claims/:id` (detail per batch)
- [ ] **Vendor Decision**: UI Modal input status (ACCEPTED/REJECTED), kompensasi, dan `rejectReason` per item
- [ ] **Vendor Decision**: Auto-kalkulasi status `VendorClaim` (PROCESSING → COMPLETED)

---

### Phase 6: Management & Admin (Week 5-6)
**Fokus:** Dashboard metrics, reporting, dan user management.

- [ ] **User Management**: Halaman `/dashboard/users` untuk Admin (Create user, assign role, toggle active)
- [ ] **Dashboard Overview**: Halaman home `/dashboard` dengan agregasi metrik/statistik
- [ ] **Reports**: Halaman `/dashboard/reports` (grafik tren klaim, performa per vendor, defect terbanyak)
- [ ] **Reports Export**: Fitur export seluruh statistik/laporan tabel ke format Excel/PDF

---

### Phase 7: Testing & Polish (Week 6-7)
**Fokus:** Memastikan stabilitas sistem dan UI/UX yang mulus.

- [ ] **Unit Tests**: Test logic perhitungan status klaim, helper/composables
- [ ] **Integration Tests**: Test security endpoints (upload foto, auth middleware)
- [ ] **UX Polish**: Penambahan loading state, skeleton loaders, success/error toast notifications
- [ ] **Bug Fixes**: E2E testing seluruh alur dari CS → QRCC → Vendor Claim

---

### Phase 8: Demo & Production (Week 7-8)
**Fokus:** Persiapan launch ke server production.

- [ ] **Final Testing**: User Acceptance Testing dengan management
- [ ] **Documentation**: Generate API documentation (jika diperlukan) & technical docs
- [ ] **Deployment**: Setup server, Nginx, CI/CD pipeline, PM2/Docker