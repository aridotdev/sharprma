# RMA CLAIM SYSTEM — PRODUCT REQUIREMENTS DOCUMENT (PRD)

> **Status**: FINALIZED & LOCKED ✅  
> **Last Update**: 2026-03-04  
> **Purpose**: Single source of truth untuk development — menggabungkan semua dokumen spesifikasi

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [User Role & Pages](#2-user-role--pages)
3. [Database Design](#3-database-design)
4. [Flow Sistem](#4-flow-sistem)
5. [Development Guideline](#5-development-guideline)
6. [Constants & Types](#6-constants--types)
7. [User-Auth Integration](#7-user-auth-integration)

---

## 1. PROJECT OVERVIEW

### A. Tujuan Sistem

Membangun sistem internal RMA (Return Merchandise Authorization) Claim dengan:

- Alur CS → QRCC → Vendor
- Validasi foto & data berbasis vendor
- Audit trail lengkap
- Reporting & analytics

### B. Tech Stack (WAJIB digunakan)

#### Core Stack

```
Frontend & Backend: Nuxt 4
UI Components:      Nuxt UI
Icons:              iconify-json/lucide
Database:           SQLite
ORM:                Drizzle ORM
Language:           TypeScript
Auth:               Better-Auth
Validation:         Zod
```

#### Utilities

```
Date/Time:          date-fns
Charts:             unovis/vue
Excel:              xlsx
Image Processing:   sharp
Environment:        dotenv
Styling:            tailwindcss
Linting:            eslint
```

### C. Commands & Development Workflow

```bash
npm run dev              # Development server
npm run build            # Production build
npm run preview          # nuxt preview
npm run postinstall      # nuxt prepare
npm run lint             # ESLint checking
npm run lint:fix         # ESLint Error Fixing
npm run typecheck        # TypeScript validation
npm run test             # Run all tests (Vitest)
npm run db:generate      # Generate migrations
npm run db:migrate       # Apply migrations
npm run db:studio        # Database studio
```

### D. Code Style Guidelines

- **Formatting**: 2-space indentation, LF line endings, no trailing whitespace
- **Vue Components**: Use `<script setup lang="ts">` with Composition API
- **Imports**: Relative imports only - Vue/Nuxt → third-party → local
- **Database**: Drizzle ORM with SQLite, schemas in `/server/database/schema/`
- **Validation**: Gunakan Zod schema validation yang tepat untuk setiap tipe API route http request (Runtime + Type-Safe Request Utils)
- **Error Handling**: `createError()` with proper status codes in try/catch blocks
- **File Naming**: PascalCase for components, camelCase for utils/composables
- **Testing**: Vitest dengan `.test.ts` atau `.spec.ts` suffixes

### E. Separation of Concerns

| Layer      | Tanggung Jawab                   | Tidak Boleh                   | Folder                         |
| ---------- | -------------------------------- | ----------------------------- | ------------------------------ |
| API Route  | HTTP, Auth, Validasi input dasar | Business logic, Query DB      | `server/api/*`                 |
| Service    | Business logic, Koordinasi       | Query DB langsung, HTTP stuff | `server/services/*.service.ts` |
| Repository | CRUD database                    | Business logic, Auth          | `server/repositories/*.repo.ts`|

### F. Tujuan Akhir

1. Menjadi aplikasi yang siap untuk di-demokan.
2. Sudah lolos testing dan audit.
3. Aplikasi yang siap digunakan oleh tim dan user.

---

## 2. USER ROLE & PAGES

### 2.1 User & Role

| Role           | Capabilities                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| **CS**         | Create & revisi claim, Upload foto, View status klaim sendiri                                            |
| **QRCC**       | Review & verify foto, Approve/reject claim, Generate vendor claim, Analytics & reports, CRUD master data |
| **MANAGEMENT** | View reports & analytics                                                                                 |
| **ADMIN**      | Full access + user management                                                                            |

**Ringkasan Akses Menu:**

| Menu                | CS  | QRCC | Management | Admin |
| ------------------- | --- | ---- | ---------- | ----- |
| Create/Revisi Claim | ✅   | ❌    | ❌          | ❌     |
| Review Claim        | ❌   | ✅    | ❌          | ✅     |
| Approve / Reject    | ❌   | ✅    | ❌          | ✅     |
| Reports             | ❌   | ✅    | ✅          | ✅     |
| Master Data         | ❌   | ✅    | ❌          | ✅     |
| User Management     | ❌   | ❌    | ❌          | ✅     |

### 2.2 Daftar Halaman

#### 🔐 Auth (Semua Role)

| URL      | Keterangan                 | Access |
| -------- | -------------------------- | ------ |
| `/login` | Halaman login (semua role) | Public |

#### 🧑 CS Area (`/cs`)

| URL                  | Keterangan                                                                                      | Access |
| -------------------- | ----------------------------------------------------------------------------------------------- | ------ |
| `/cs`                | Home CS: hero input Notification Code + daftar klaim milik CS (filter by status, tanggal, dll) | CS     |
| `/cs/claim/create`   | Multi-step form wizard buat claim baru (`?notification=<code>`)                                 | CS     |
| `/cs/claim/:id`      | Detail klaim (read-only): info, foto, status, + tab **Claim History** (audit trail per klaim)  | CS     |
| `/cs/claim/:id/edit` | Edit klaim mode revisi (aktif saat status `NEED_REVISION`)                                      | CS     |

#### 📊 Dashboard Area (`/dashboard`)

> Diakses oleh QRCC, Management, Admin. Konten sidebar & widget berbeda per role.

**Overview**

| URL          | Keterangan                                               | Access                  |
| ------------ | -------------------------------------------------------- | ----------------------- |
| `/dashboard` | Home dashboard: statistik & widget ringkasan sesuai role | QRCC, Management, Admin |

**Claims Management**

| URL                     | Keterangan                                                                                      | Access      |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ----------- |
| `/dashboard/claims`     | Daftar klaim (filter by: status, vendor, tanggal)                                               | QRCC, Admin |
| `/dashboard/claims/:id` | Detail klaim lengkap + interface review foto, approve/reject, + tab **Claim History** per klaim | QRCC, Admin |

**Audit Trail**

| URL                      | Keterangan                                                                                     | Access      |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ----------- |
| `/dashboard/audit-trail` | Log semua ClaimHistory lintas klaim (filter by: klaim, user, action, tanggal); export ke Excel | QRCC, Admin |

**Vendor Claims**

| URL                               | Keterangan                                                                 | Access      |
| --------------------------------- | -------------------------------------------------------------------------- | ----------- |
| `/dashboard/vendor-claims`        | Daftar Vendor Claim (filter by: vendor, status)                            | QRCC, Admin |
| `/dashboard/vendor-claims/create` | Wizard: pilih klaim APPROVED yang belum diklaim → preview → generate batch | QRCC, Admin |
| `/dashboard/vendor-claims/:id`    | Detail Vendor Claim + input keputusan & kompensasi vendor per item         | QRCC, Admin |

**Master Data**

| URL                               | Keterangan                                               | Access      |
| --------------------------------- | -------------------------------------------------------- | ----------- |
| `/dashboard/master/vendor`        | CRUD Vendor (termasuk editor JSON requiredPhotos/Fields) | QRCC, Admin |
| `/dashboard/master/product-model` | CRUD Product Model                                       | QRCC, Admin |
| `/dashboard/master/notification`  | CRUD Notification Master                                 | QRCC, Admin |
| `/dashboard/master/defect`        | CRUD Defect Master                                       | QRCC, Admin |

**Reports**

| URL                  | Keterangan                                              | Access                  |
| -------------------- | ------------------------------------------------------- | ----------------------- |
| `/dashboard/reports` | Analytics & reports: klaim per periode, per vendor, dll | QRCC, Management, Admin |

**User Management**

| URL                | Keterangan                                             | Access |
| ------------------ | ------------------------------------------------------ | ------ |
| `/dashboard/users` | Daftar user: tambah, toggle active, ubah role & branch | Admin  |

#### 👤 Profile (Semua Role)

| URL        | Keterangan                       | Access    |
| ---------- | -------------------------------- | --------- |
| `/profile` | Lihat & edit nama, ubah password | All Roles |

### 2.3 Navigasi Sidebar per Role

**CS**
```
🏠  Home              /cs
📋  My Claims         (section list di /cs)
👤  Profile           /profile
```

**QRCC**
```
🏠  Dashboard         /dashboard
📋  Claims            /dashboard/claims
📦  Vendor Claims     /dashboard/vendor-claims
🗄️  Master Data       (collapsible group)
    ├── Vendor              /dashboard/master/vendor
    ├── Product Model       /dashboard/master/product-model
    ├── Notification        /dashboard/master/notification
    └── Defect Master       /dashboard/master/defect
📊  Reports           /dashboard/reports
🕵️  Audit Trail       /dashboard/audit-trail
👤  Profile           /profile
```

**Management**
```
🏠  Dashboard         /dashboard
📊  Reports           /dashboard/reports
👤  Profile           /profile
```

**Admin**
```
🏠  Dashboard         /dashboard
📋  Claims            /dashboard/claims
📦  Vendor Claims     /dashboard/vendor-claims
🗄️  Master Data       (collapsible group)
    ├── Vendor              /dashboard/master/vendor
    ├── Product Model       /dashboard/master/product-model
    ├── Notification        /dashboard/master/notification
    └── Defect Master       /dashboard/master/defect
📊  Reports           /dashboard/reports
🕵️  Audit Trail       /dashboard/audit-trail
👥  Users             /dashboard/users
👤  Profile           /profile
```

### 2.4 Catatan Penting

- **Post-login redirect:** setelah login, sistem redirect otomatis sesuai role:
  - CS → `/cs`
  - QRCC / Management / Admin → `/dashboard`
- **Route protection (middleware):**
  - `/cs/*` → hanya CS
  - `/dashboard/*` → hanya QRCC, Management, Admin
  - `/dashboard/claims/*` → hanya QRCC, Admin
  - `/dashboard/vendor-claims/*` → hanya QRCC, Admin
  - `/dashboard/master/*` → hanya QRCC, Admin
  - `/dashboard/users` → hanya Admin
- **Unauthorized redirect:** akses ke URL yang tidak sesuai role → redirect ke halaman home masing-masing
- **Profile `/profile`:** semua role bisa akses, hanya bisa edit nama & ubah password (bukan role/branch — itu hanya bisa diubah Admin)

---

## 3. DATABASE DESIGN

### 3.1 Design Principles

- **Timestamp Format**: `integer` (Unix miliseconds) with Drizzle `mode: 'timestamp_ms'`
- **Boolean Format**: `integer` with Drizzle `mode: 'boolean'` (0/1 → true/false)
- **Enum Format**: `text` + Zod validation (no DB enum)
- **Soft Delete Strategy**: Use flags/status instead of actual deletion
- **Foreign Keys**: All integer type
- **Audit Trail**: Append-only history log
- **Schema Drizzle**: 1 table/schema per 1 file

### 3.2 Timestamp Implementation

```typescript
// Standard timestamp field
createdAt: integer({ mode: 'timestamp_ms' })
  .notNull()
  .default(sql`(unixepoch() * 1000)`),

updatedAt: integer({ mode: 'timestamp_ms' })
  .notNull()
  .default(sql`(unixepoch() * 1000)`)
  .$onUpdateFn(() => new Date())
```

### 3.3 Cascade Delete Strategy

**Vendor (Soft Delete)**
```
Strategy: isActive flag
- Vendor tidak benar-benar dihapus
- isActive = false untuk non-aktifkan
- Data historis tetap utuh
```

**User (Soft Delete)**
```
Strategy: isActive flag
- User tidak benar-benar dihapus
- isActive = false untuk non-aktifkan
- Data historis tetap utuh
- User non-aktif tidak bisa login
```

**Claim (Soft Delete via Status)**
```
Strategy: claimStatus = 'ARCHIVED'
- Claim tidak benar-benar dihapus
- "Hapus claim" = ubah status jadi ARCHIVED
- Claim ARCHIVED tidak muncul di list aktif
- Audit trail tetap lengkap
```

### 3.4 Master Tables

#### 3.4.1 Vendor

| Kolom          | Tipe    | Constraint                            | Keterangan               |
| -------------- | ------- | ------------------------------------- | ------------------------ |
| id             | integer | PK                                    | ID vendor                |
| code           | text    | NOT NULL, UNIQUE                      | Kode vendor (identifier) |
| name           | text    | NOT NULL                              | Nama vendor (UI display) |
| requiredPhotos | json    | NOT NULL, DEFAULT '[]'                | Array enum photoType     |
| requiredFields | json    | NOT NULL, DEFAULT '[]'                | Array enum fieldName     |
| isActive       | integer | NOT NULL                              | Boolean                  |
| createdBy      | integer | FK -> profile.id onDelete: 'restrict' | ID user                  |
| updatedBy      | integer | FK -> profile.id onDelete: 'restrict' | ID user                  |
| createdAt      | integer | NOT NULL                              | Waktu dibuat             |
| updatedAt      | integer | NOT NULL                              | Waktu ada update         |

INDEX:
- INDEX (isActive)
- INDEX (createdAt)
- UNIQUE (code)

📌 CATATAN:
- Vendor menggunakan soft delete (isActive flag)
- `requiredPhotos`: menyimpan array dari `ClaimPhoto.photoType` (misal: `["CLAIM", "ODF"]`)
- `requiredFields`: menyimpan array field opsional yang diwajibkan (misal: `["odfNumber", "version"]`)

#### 3.4.2 ProductModel

| Kolom     | Tipe    | Constraint                            | Keterangan    |
| --------- | ------- | ------------------------------------- | ------------- |
| id        | integer | PK                                    | ID model      |
| name      | text    | NOT NULL, UNIQUE                      | Nama Model    |
| inch      | integer | NOT NULL                              | Ukuran inch   |
| vendorId  | integer | FK -> vendor.id onDelete: 'restrict'  | Kode vendor   |
| isActive  | integer | NOT NULL                              | Boolean       |
| createdBy | integer | FK -> profile.id onDelete: 'restrict' | dibuat Oleh   |
| updatedBy | integer | FK -> profile.id onDelete: 'restrict' | diupdate Oleh |
| createdAt | integer | NOT NULL                              | Waktu dibuat  |
| updatedAt | integer | NOT NULL                              | Waktu update  |

INDEX:
- UNIQUE (name, vendorId)
- INDEX (vendorId)
- INDEX (isActive)
- INDEX (createdAt)
- INDEX (vendorId, isActive)

#### 3.4.3 NotificationMaster

| Kolom            | Tipe    | Constraint                               | Keterangan                          |
| ---------------- | ------- | ---------------------------------------- | ----------------------------------- |
| id               | integer | PK                                       | ID notification ref                 |
| notificationCode | text    | UNIQUE                                   | Kode notifikasi                     |
| notificationDate | integer | NOT NULL                                 | Tanggal notifikasi (Unix timestamp) |
| modelId          | integer | FK -> productModel.id onDelete: restrict | ID/Kode model                       |
| branch           | text    | NOT NULL                                 | Cabang CS                           |
| vendorId         | integer | FK -> vendor.id onDelete: 'restrict'     | Kode vendor                         |
| status           | text    | NOT NULL                                 | NEW / USED / EXPIRED                |
| createdBy        | integer | FK -> profile.id onDelete: 'restrict'    | dibuat oleh                         |
| updatedBy        | integer | FK -> profile.id onDelete: 'restrict'    | diupdate oleh                       |
| createdAt        | integer | NOT NULL                                 | Waktu dibuat                        |
| updatedAt        | integer | NOT NULL                                 | Waktu diupdate                      |

INDEX:
- UNIQUE (notificationCode)
- INDEX (vendorId)
- INDEX (notificationDate)
- INDEX (status)
- INDEX (createdAt)
- INDEX (vendorId, status)
- INDEX (vendorId, notificationDate)

#### 3.4.4 DefectMaster

| Kolom     | Tipe    | Constraint                            | Keterangan       |
| --------- | ------- | ------------------------------------- | ---------------- |
| id        | integer | PK                                    | ID DefectMaster  |
| code      | text    | NOT NULL, UNIQUE                      | Kode defect      |
| name      | text    | NOT NULL                              | Nama defect      |
| isActive  | integer | NOT NULL                              | Boolean          |
| createdBy | integer | FK -> profile.id onDelete: 'restrict' | dibuat oleh      |
| updatedBy | integer | FK -> profile.id onDelete: 'restrict' | diupdate oleh    |
| createdAt | integer | NOT NULL                              | Waktu dibuat     |
| updatedAt | integer | NOT NULL                              | Waktu ada update |

INDEX:
- UNIQUE (name)
- INDEX (isActive)
- INDEX (createdAt)

---

### 3.5 Transaction Tables

#### 3.5.1 Claim

| Kolom          | Tipe    | Constraint                                       | Keterangan       |
| -------------- | ------- | ------------------------------------------------ | ---------------- |
| id             | integer | PK                                               | ID Klaim         |
| claimNumber    | text    | NOT NULL, UNIQUE                                 | Kode Klaim       |
| notificationId | integer | FK -> notificationMaster.id onDelete: 'restrict' | ID Notifikasi    |
| modelId        | integer | FK -> productModel.id onDelete: restrict         | ID/Kode model    |
| vendorId       | integer | FK -> vendor.id onDelete: 'restrict'             | Kode vendor      |
| inch           | integer | NOT NULL                                         | Ukuran inch      |
| branch         | text    | NOT NULL                                         | Nama cabang      |
| odfNumber      | text    |                                                  | Nomor Odf        |
| panelSerialNo  | text    | NOT NULL                                         | Nomor seri panel |
| ocSerialNo     | text    | NOT NULL                                         | Nomor seri oc    |
| defectCode     | text    | FK -> defectMaster.code onDelete: 'restrict'     | Kode kerusakan   |
| version        | text    |                                                  | Nomor versi      |
| week           | text    |                                                  | Kode Week        |
| claimStatus    | text    | NOT NULL                                         | Status Klaim     |
| submittedBy    | integer | FK -> profile.id                                 | Id CS            |
| updatedBy      | integer | FK -> profile.id                                 | Diupdate oleh    |
| createdAt      | integer | NOT NULL                                         | Waktu dibuat     |
| updatedAt      | integer | NOT NULL                                         | Waktu ada update |

INDEX:
- UNIQUE (claimNumber)
- INDEX (vendorId)
- INDEX (claimStatus)
- INDEX (submittedBy)
- INDEX (vendorId, claimStatus)

📌 CATATAN:
- Generate claimNumber: `CL-{YYYYMMDD}-{Sequence}`
- `branch` adalah snapshot dari `profile.branch` || `notificationMaster.branch`
- `CLAIM_STATUSES = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'NEED_REVISION', 'APPROVED', 'ARCHIVED']`
- Claim menggunakan soft delete via `claimStatus = ARCHIVED`

---

#### 3.5.2 ClaimPhoto

| Kolom         | Tipe    | Constraint                          | Keterangan       |
| ------------- | ------- | ----------------------------------- | ---------------- |
| id            | integer | PK                                  | ID Klaim foto    |
| claimId       | integer | FK -> claim.id onDelete: 'restrict' | Kode Klaim       |
| photoType     | text    | NOT NULL                            | Tipe/nama foto   |
| filePath      | text    | NOT NULL                            | File path foto   |
| thumbnailPath | text    |                                     | Thumbnail path   |
| status        | text    | NOT NULL                            | Status foto      |
| rejectReason  | text    |                                     | Catatan reject   |
| createdAt     | integer | NOT NULL                            | Waktu dibuat     |
| updatedAt     | integer | NOT NULL                            | Waktu ada update |

INDEX:
- UNIQUE (claimId, photoType)
- INDEX (claimId)

Photo Upload API:
- File Storage: `./public/uploads/claims/`
- Unique filename: `{claimId}_{photoType}_{timestamp}.jpg`
- Nuxt/H3: Use `readMultipartFormData`
- Validasi File:
  ```typescript
  const ALLOWED_TYPES = ['image/jpeg', 'image/png']
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  ```
- Security: sanitize filename, prevent directory traversal
- Thumbnail: 300×300px menggunakan library `sharp`
- `enum photoType = ["CLAIM", "CLAIM_ZOOM", "ODF", "PANEL_SN", "WO_PANEL", "WO_PANEL_SN"]`
- `enum status = ['PENDING', 'VERIFIED', 'REJECT']` (default: `'PENDING'`)

---

#### 3.5.3 VendorClaim

| Kolom          | Tipe    | Constraint       | Keterangan                             |
| -------------- | ------- | ---------------- | -------------------------------------- |
| id             | integer | PK               | ID vendor klaim                        |
| vendorClaimNo  | text    | UNIQUE           | No klaim vendor                        |
| vendorId       | integer | FK -> vendor.id  | Kode vendor                            |
| submittedAt    | integer | NOT NULL         | Waktu kirim ke vendor (Unix timestamp) |
| reportSnapshot | text    | NOT NULL         | Snapshot JSON data klaim               |
| status         | text    | NOT NULL         | Status vendor claim                    |
| createdBy      | integer | FK -> profile.id | Dibuat oleh                            |
| updatedBy      | integer | FK -> profile.id | Diupdate oleh                          |
| createdAt      | integer | NOT NULL         | Waktu dibuat                           |
| updatedAt      | integer | NOT NULL         | Waktu ada update                       |

📌 CATATAN:
- `enum status = ['DRAFT', 'CREATED', 'PROCESSING', 'COMPLETED']`
- Generate `vendorClaimNo`: `VC-{YYYYMMDD}-{Sequence}`

---

#### 3.5.4 VendorClaimItem

| Kolom            | Tipe    | Constraint                               | Keterangan                       |
| ---------------- | ------- | ---------------------------------------- | -------------------------------- |
| id               | integer | PK                                       | ID item klaim vendor             |
| vendorClaimId    | integer | FK -> vendorClaim.id onDelete: 'cascade' | ID klaim vendor                  |
| claimId          | integer | FK -> claim.id onDelete: 'restrict'      | ID klaim                         |
| vendorDecision   | text    | NOT NULL                                 | Keputusan vendor                 |
| compensation     | integer |                                          | Kompensasi (jika ACCEPTED)       |
| rejectReason     | text    |                                          | Alasan reject (jika REJECTED)    |
| vendorDecisionBy | integer | FK -> profile.id                         | Dibuat oleh                      |
| vendorDecisionAt | integer |                                          | Waktu keputusan (Unix timestamp) |
| createdAt        | integer | NOT NULL                                 | Waktu dibuat                     |
| updatedAt        | integer |                                          | Waktu ada update                 |

📌 CATATAN:
- `enum vendorDecision = ['PENDING', 'ACCEPTED', 'REJECTED']`
- `rejectReason` wajib diisi jika `vendorDecision = REJECTED`

---

#### 3.5.5 ClaimHistory

| Kolom      | Tipe    | Constraint                            | Keterangan       |
| ---------- | ------- | ------------------------------------- | ---------------- |
| id         | integer | PK                                    | ID klaim histori |
| claimId    | integer | FK -> claim.id onDelete: 'restrict'   | id claim         |
| action     | text    | NOT NULL                              | Jenis aksi       |
| fromStatus | text    | NOT NULL                              | status awal      |
| toStatus   | text    | NOT NULL                              | status akhir     |
| userId     | integer | FK -> profile.id onDelete: 'restrict' | ID User          |
| userRole   | text    | NOT NULL                              | snapshot role    |
| note       | text    |                                       | catatan          |
| createdAt  | integer | NOT NULL                              | Waktu dibuat     |

INDEX:
- INDEX (claimId)
- INDEX (userId)

📌 CATATAN:
- `enum action` merujuk pada `CLAIM_HISTORY_ACTIONS` di [Section 6](#6-constants--types)

---

#### 3.5.6 PhotoReview

| Kolom        | Tipe    | Constraint                               | Keterangan                    |
| ------------ | ------- | ---------------------------------------- | ----------------------------- |
| id           | integer | PK                                       | ID foto review                |
| claimPhotoId | integer | FK -> claimPhoto.id onDelete: 'restrict' | Kode Klaim                    |
| reviewedBy   | integer | FK -> profile.id onDelete: 'restrict'    | Di review oleh                |
| status       | text    | NOT NULL                                 | VERIFIED / REJECT             |
| rejectReason | text    |                                          | Catatan reject                |
| reviewedAt   | integer | NOT NULL                                 | Waktu review (Unix timestamp) |

INDEX:
- INDEX (claimPhotoId)
- INDEX (reviewedBy)

📌 CATATAN:
- `enum status` merujuk pada `CLAIM_PHOTO_STATUSES` di [Section 6](#6-constants--types)

---

#### 3.5.7 SequenceGenerator

| Kolom        | Tipe    | Constraint | Keterangan                       |
| ------------ | ------- | ---------- | -------------------------------- |
| id           | integer | PK         | ID sequence                      |
| type         | text    | NOT NULL   | CLAIM / VENDOR_CLAIM             |
| currentDate  | text    | NOT NULL   | Format YYYYMMDD                  |
| lastSequence | integer | NOT NULL   | Nomor urut terakhir (default: 0) |

INDEX:
- UNIQUE (type, currentDate)

📌 CATATAN:
- `enum type` merujuk pada `SEQUENCE_TYPES` di [Section 6](#6-constants--types)
- Digunakan untuk generate `CL-{YYYYMMDD}-{Sequence}` dan `VC-{YYYYMMDD}-{Sequence}`
- Reset sequence otomatis per hari (berdasarkan currentDate)

---

### 3.6 User Tables

#### 3.6.1 Profile (Business Data)

| Kolom      | Tipe    | Constraint       | Keterangan     |
| ---------- | ------- | ---------------- | -------------- |
| id         | integer | PK               | ID user        |
| userAuthId | text    | UNIQUE, NOT NULL | Auth id (UUID) |
| name       | text    | NOT NULL         | Nama user      |
| role       | text    | NOT NULL         | enum role      |
| branch     | text    |                  | branch         |
| isActive   | integer | NOT NULL (0/1)   | Boolean        |
| createdAt  | integer | NOT NULL         | Waktu dibuat   |
| updatedAt  | integer | NOT NULL         | Waktu diupdate |

INDEX:
- UNIQUE (userAuthId)
- INDEX (role)

📌 CATATAN:
- `enum role = ['ADMIN', 'CS', 'QRCC', 'MANAGEMENT']`
- User menggunakan soft delete (isActive flag)
- Branch bisa di-update, claim menyimpan snapshot branch
- User tidak benar-benar dihapus dari database
- User yang `isActive = false` tidak bisa login, tapi data historis tetap utuh
- Semua relasi (Claim.submittedBy, ClaimHistory.userId, dll) TIDAK PERLU `onDelete: 'restrict'`

#### 3.6.2 Auth (Better-Auth)

Schema dibuatkan otomatis oleh Better-Auth dengan fitur:

- Email & Password authentication
- Username plugin (display name)
- Admin plugin
- Session management:
  - Expire: 7 hari
  - Ratelimit: true
  - Max attempt: 5 kali
  - Lock duration: 15 menit

---

## 4. FLOW SISTEM

### 4.1 Flow CS — Form Claim RMA

🟢 **Kondisi Awal**
- CS sudah login, Role = CS
- Di halaman index CS ada input field untuk memasukan **Notification Code**

#### Entry Point: Halaman Create Claim

1. CS ketik notification code di input field hero section
2. CS klik enter/tombol "Start Claim"
3. **Sistem redirect ke `/cs/claim/create?notification=<code>`**
4. Sistem melakukan lookup ke tabel `notification`

> **Catatan:** URL menyimpan `notificationCode` sebagai query param sehingga halaman bisa di-refresh tanpa kehilangan context awal.

---

#### 📝 Multi-Step Form Wizard (3 Steps)

##### Step 1: Notification & Defect Information

> Combined dari Step 1 & 2 untuk mempercepat input

**1.1 Notification Lookup Result**

**✅ Jika Notification DITEMUKAN:**
- Alert success: "Notification ditemukan"
- Data terisi otomatis (read-only): `notificationCode`, `productModelId`, `inch`, `vendorId`, `branch` (dari `notification.branch`)

**❌ Jika Notification TIDAK DITEMUKAN:**
- Alert info: "Notification tidak ditemukan, isi manual"
- CS mengisi `modelName` dengan **autocomplete** (dari tabel `ProductModel`)
- Jika model dipilih, auto-fill: `vendorId`, `inch`, `branch` (dari `profile.branch`)
- Sistem *auto-generate* NotificationMaster record saat Claim disubmit

**1.2 Serial Numbers & Defect Info**

CS mengisi: `panelSerialNo`, `ocSerialNo`, `defect` (dropdown dari DefectMaster)

**1.3 Conditional Fields (Vendor-specific)**

Berdasarkan `VendorFieldRule`, field berikut muncul/hilang:
- `odfNumber` → jika vendor membutuhkan
- `version` → jika vendor membutuhkan
- `week` → jika vendor membutuhkan

**1.4 Auto-save saat klik "Next" ke Step 2:**
- Jika `notificationCode` manual → auto-insert ke `NotificationMaster` dengan status `USED`
- Auto-save claim draft (status: `DRAFT`)
- Visual indicator: "Auto-saved ✓"

---

##### Step 2: Photo Evidence

**Sistem menampilkan upload zones berdasarkan VendorPhotoRule:**

| Vendor   | CLAIM | CLAIM_ZOOM | ODF | PANEL_SN | WO_PANEL | WO_PANEL_SN |
| -------- | ----- | ---------- | --- | -------- | -------- | ----------- |
| **MOKA** | ✅     | ✅          | ✅   | ✅        | ✅        | ✅           |
| **MTC**  | ✅     | ✅          | ✅   | ✅        | ❌        | ❌           |
| **SDP**  | ✅     | ✅          | ✅   | ✅        | ❌        | ❌           |

**Fitur Upload:**
- ✅ Drag & Drop Support
- ✅ Real-time Preview (thumbnail + lightbox zoom)
- ✅ Upload Progress (progress bar per foto)
- ✅ Smart Validation (max 5MB, JPG/PNG only)
- Status foto initial: `PENDING`; bisa re-upload selama belum `APPROVED`

**Auto-save saat klik "Next" ke Step 3**

---

##### Step 3: Review & Submit

**Sistem menampilkan summary semua data (read-only):** Notification Info, Defect Info, Photo Evidence

**Actions:**
- Button "Edit" → kembali ke step sebelumnya
- Button "Save as Draft" (manual save)
- Button "Submit to QRCC" (primary action)

**Submit Validation:**
1. ✅ Semua field wajib vendor terisi
2. ✅ Semua foto wajib vendor sudah di-upload
3. ✅ Tidak ada error format

**Jika valid:**
- `claimStatus → SUBMITTED`
- Record `ClaimHistory` dibuat: `action = SUBMIT`, `actorRole = CS`
- Redirect ke `/cs` + success toast

**Jika invalid:**
- Error message dengan detail field yang belum valid

---

#### Aksi CS berdasarkan Status Klaim

| Status Klaim  | Aksi CS                       | Auto-save         |
| ------------- | ----------------------------- | ----------------- |
| DRAFT         | Edit bebas, save kapan saja   | ✅ Per step change |
| SUBMITTED     | Read-only, view status        | ❌                 |
| NEED_REVISION | Edit terbatas (item rejected) | ✅ Per step change |
| APPROVED      | Read-only, export PDF         | ❌                 |
| ARCHIVED      | Read-only                     | ❌                 |

---

#### 🔧 Revision Flow

**Jika Klaim NEED_REVISION:**

1. `claimStatus → NEED_REVISION`, foto ditolak → `photoStatus → REJECTED`
2. Dashboard CS menampilkan badge "Need Revision"
3. CS klik claim → redirect ke `/cs/claim/:id/edit`

**Revision Interface:**
- 🔴 Red badge pada field/foto yang di-reject
- 💬 QRCC notes displayed prominently
- Side-by-side comparison: foto lama (rejected) vs upload zone baru
- Tombol "Submit Revision" disabled sampai semua item fixed

**Submit Revision:**
1. CS klik "Submit Revision"
2. `claimStatus → SUBMITTED`
3. `ClaimHistory`: `action = REVISION_SUBMIT`, `actorRole = CS`

---

### 4.2 Flow QRCC — Review Claim RMA

🟢 **Kondisi Awal**
- QRCC sudah login, Role = QRCC (atau ADMIN)
- Di `/dashboard/claims` tersedia daftar klaim dengan status `SUBMITTED`

#### Review Klaim

**1. Buka Detail Klaim**

Saat QRCC klik klaim:
- Redirect ke `/dashboard/claims/:id`
- `claimStatus → IN_REVIEW` (otomatis)
- `ClaimHistory`: `action = START_REVIEW`, `fromStatus = SUBMITTED`, `toStatus = IN_REVIEW`

**2. Layout Halaman Review (3 Tab)**

```
TAB 1: Claim Info (sebagian editable)
TAB 2: Photo Review
TAB 3: Claim History (audit trail read-only)
```

**3. TAB 1 — Claim Info**

Field READ-ONLY: `notificationCode`, `notificationDate`, `modelName`, `inch`, `vendorId`, `branch`

Field EDITABLE oleh QRCC:

| Field           | Tipe Input      | Keterangan              |
| --------------- | --------------- | ----------------------- |
| `panelSerialNo` | text            | Serial panel            |
| `ocSerialNo`    | text            | Serial OC               |
| `defect`        | autocomplete    | Dari DefectMaster       |
| `odfNumber`     | text (opsional) | Jika vendor membutuhkan |
| `version`       | text (opsional) | Jika vendor membutuhkan |
| `week`          | text (opsional) | Jika vendor membutuhkan |

> Perubahan data QRCC tidak mengubah status klaim. Status tetap `IN_REVIEW`.

**4. TAB 2 — Photo Review**

QRCC mereview setiap foto: pilih **VERIFIED** atau **REJECT** (jika REJECT: wajib isi catatan)

Record `PhotoReview` dibuat per foto: `claimPhotoId`, `reviewedBy`, `status`, `note`, `reviewedAt`

**5. Submit Review**

Tombol "Selesai Review" aktif saat semua foto sudah direview.

```
Jika ada foto REJECTED:
  → claimStatus = NEED_REVISION
  → Update ClaimPhoto.status = REJECTED
  → ClaimHistory: action = REJECT, toStatus = NEED_REVISION
  → Notifikasi muncul di dashboard CS pemilik klaim

Jika semua foto VERIFIED:
  → claimStatus = APPROVED
  → Update ClaimPhoto.status = VERIFIED (semua)
  → ClaimHistory: action = APPROVE, toStatus = APPROVED
```

**Aksi QRCC berdasarkan Status:**

| Status Klaim  | Aksi QRCC                                  |
| ------------- | ------------------------------------------ |
| SUBMITTED     | Buka detail → auto IN_REVIEW               |
| IN_REVIEW     | Edit field tertentu, review foto, submit   |
| NEED_REVISION | Read-only, tunggu revisi CS                |
| APPROVED      | Read-only, bisa dimasukkan ke Vendor Claim |
| ARCHIVED      | Read-only                                  |

---

#### 📦 Alur Vendor Claim

**1. Generate Vendor Claim (Wizard 3 Step)**

Entry point: `/dashboard/vendor-claims/create`

**Step 1 — Pilih Vendor & Filter Klaim**
- QRCC pilih **Vendor** dan **Filter periode** (opsional)
- Sistem tampilkan daftar klaim `APPROVED` yang belum masuk Vendor Claim, filtered by vendor

**Step 2 — Checklist Klaim**
- QRCC centang klaim yang akan dimasukkan ke batch
- "Select All" tersedia; minimal 1 klaim harus dipilih

**Step 3 — Preview & Generate**

Saat QRCC klik "Generate Vendor Claim":
1. Buat record `VendorClaim`: `vendorClaimNo = VC-{YYYYMMDD}-{Sequence}`, `status = CREATED`
2. Buat record `VendorClaimItem` per klaim: `vendorDecision = PENDING`
3. **File Excel auto-generate & download** (data klaim + link foto)
4. Redirect ke `/dashboard/vendor-claims/:id`

> Pengiriman file Excel ke vendor dilakukan **manual di luar sistem**.

**2. Input Keputusan Vendor (Per Item)**

Modal per item:
- `vendorDecision`: ACCEPTED / REJECTED
- `compensation`: nominal integer (wajib jika ACCEPTED)
- `rejectReason`: text (wajib jika REJECTED)
- `vendorDecisionAt`: timestamp otomatis

Auto-kalkulasi status VendorClaim:
```
Masih ada item PENDING  → status = PROCESSING
Semua item terisi       → status = COMPLETED
```

**Status VendorClaim:**

| Status     | Kondisi                                        |
| ---------- | ---------------------------------------------- |
| CREATED    | Baru di-generate, belum ada keputusan vendor   |
| PROCESSING | Ada sebagian keputusan vendor yang sudah diisi |
| COMPLETED  | Semua item sudah ada keputusan vendor          |

---

#### 🗄️ Master Data Management

| Master Data   | URL                               | Fitur Khusus                              |
| ------------- | --------------------------------- | ----------------------------------------- |
| Vendor        | `/dashboard/master/vendor`        | Toggle active/inactive, editor JSON rules |
| Product Model | `/dashboard/master/product-model` | Filter by vendor                          |
| Notification  | `/dashboard/master/notification`  | Input manual + **Import Excel**           |
| Defect Master | `/dashboard/master/defect`        | Toggle active/inactive                    |

**Import NotificationMaster (Excel):**
1. QRCC klik "Import Excel"
2. Upload file Excel (template tersedia)
3. Sistem preview + highlight baris error
4. QRCC konfirmasi → insert/update ke database
5. Summary: "X berhasil diimport, Y gagal"

Template Excel kolom: `notificationCode | notificationDate | modelName | branch | vendorId`

---

## 5. DEVELOPMENT GUIDELINE

### 5.1 Git Workflow

```
Main branch:    main
Feature branch: feature/feature-name
Bugfix branch:  bugfix/bug-name

Commit message format:
- feat:     Add feature X
- fix:      Fix bug Y
- docs:     Update documentation
- refactor: Refactor module Z
- test:     Add test for X
```

### 5.2 Development Phases

Refer to [implementation-plan.md](implementation-plan.md) untuk detail lengkap development phases, file-by-file breakdown, dan multi-agent strategy.

---

## 6. CONSTANTS & TYPES

> All enums use `as const` pattern for type safety. Import di schema files dan validation.

### 6.1 User Roles
```typescript
export const USER_ROLES = [
  'ADMIN', 'MANAGEMENT', 'QRCC', 'CS'
] as const
export type UserRole = (typeof USER_ROLES)[number]
```

### 6.2 Claim Statuses
```typescript
export const CLAIM_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'NEED_REVISION',
  'APPROVED',
  'ARCHIVED'
] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]
```

### 6.3 Photo Types
```typescript
export const PHOTO_TYPES = [
  'CLAIM',
  'CLAIM_ZOOM',
  'ODF',
  'PANEL_SN',
  'WO_PANEL',
  'WO_PANEL_SN'
] as const
export type PhotoType = (typeof PHOTO_TYPES)[number]
```

### 6.4 Claim Photo Statuses
```typescript
export const CLAIM_PHOTO_STATUSES = [
  'PENDING', 'VERIFIED', 'REJECT'
] as const
export type ClaimPhotoStatus = (typeof CLAIM_PHOTO_STATUSES)[number]
```

### 6.5 Claim Actions
```typescript
export const CLAIM_ACTIONS = [
  'CREATE',
  'SUBMIT',
  'REVIEW',
  'REQUEST_REVISION',
  'APPROVE',
  'CANCEL'
] as const
export type ClaimAction = (typeof CLAIM_ACTIONS)[number]
```

### 6.6 Claim History Actions
```typescript
export const CLAIM_HISTORY_ACTIONS = [
  'CREATE',
  'SUBMIT',
  'REVIEW',
  'APPROVE',
  'REJECT',
  'REQUEST_REVISION',
  'ARCHIVE',
  'UPDATE',
  'UPLOAD_PHOTO',
  'REVIEW_PHOTO',
  'GENERATE_VENDOR_CLAIM',
  'UPDATE_VENDOR_DECISION'
] as const
export type ClaimHistoryAction = (typeof CLAIM_HISTORY_ACTIONS)[number]
```

### 6.7 Notification Statuses
```typescript
export const NOTIFICATION_STATUSES = [
  'NEW', 'USED', 'EXPIRED'
] as const
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number]
```

### 6.8 Vendor Decisions
```typescript
export const VENDOR_DECISIONS = [
  'PENDING', 'ACCEPTED', 'REJECTED'
] as const
export type VendorDecision = (typeof VENDOR_DECISIONS)[number]
```

### 6.9 Vendor Claim Statuses
```typescript
export const VENDOR_CLAIM_STATUSES = [
  'DRAFT',
  'CREATED',
  'PROCESSING',
  'COMPLETED'
] as const
export type VendorClaimStatus = (typeof VENDOR_CLAIM_STATUSES)[number]
```

### 6.10 Field Names (for Vendor requiredFields)
```typescript
export const FIELD_NAMES = [
  'odfNumber', 'version', 'week'
] as const
export type FieldName = (typeof FIELD_NAMES)[number]
```

### 6.11 Sequence Types
```typescript
export const SEQUENCE_TYPES = ['CLAIM', 'VENDOR_CLAIM'] as const
export type SequenceType = typeof SEQUENCE_TYPES[number]
```

### 6.12 Helper Functions
```typescript
export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole)
}
export function isClaimStatus(value: string): value is ClaimStatus {
  return CLAIM_STATUSES.includes(value as ClaimStatus)
}
export function isPhotoType(value: string): value is PhotoType {
  return PHOTO_TYPES.includes(value as PhotoType)
}
export function isClaimPhotoStatus(value: string): value is ClaimPhotoStatus {
  return CLAIM_PHOTO_STATUSES.includes(value as ClaimPhotoStatus)
}
export function isNotificationStatus(value: string): value is NotificationStatus {
  return NOTIFICATION_STATUSES.includes(value as NotificationStatus)
}
export function isVendorDecision(value: string): value is VendorDecision {
  return VENDOR_DECISIONS.includes(value as VendorDecision)
}
export function isVendorClaimStatus(value: string): value is VendorClaimStatus {
  return VENDOR_CLAIM_STATUSES.includes(value as VendorClaimStatus)
}
export function isFieldName(value: string): value is FieldName {
  return FIELD_NAMES.includes(value as FieldName)
}
```

### 6.13 Default Values & Config
```typescript
export const DEFAULT_INITIAL_PASSWORD = 'sharp1234'
export const DEFAULT_SESSION_EXPIRY_DAYS = 7
export const FAILED_LOGIN_LOCK_MINUTES = 15
export const MAX_FAILED_LOGIN_ATTEMPTS = 5
```

### 6.14 Initial Vendor Data
```typescript
export const INITIAL_VENDORS = [
  'MOKA', 'MTC', 'SDP'
] as const
export type InitialVendor = (typeof INITIAL_VENDORS)[number]
```

---

## 7. USER-AUTH INTEGRATION

### 7.1 Ringkasan

Menghubungkan dua sistem user yang terpisah:
1. **Profile** — Data bisnis (role, branch, nama lengkap)
2. **Auth** — Data autentikasi (email, password, session)

### 7.2 Arsitektur Integration

**Hubungan Database:**
```
Auth                        Profile (Business Data)
┌─────────────┐             ┌───────────────────┐
│ id (UUID)   │────────────▶│ userAuthId (TEXT)  │
│ name        │             │ name               │
│ email       │             │ role               │
│ ...         │             │ branch             │
└─────────────┘             │ isActive           │
                            └───────────────────┘
```

**Konfigurasi Foreign Key:**
```sql
-- Di tabel profile
userAuthId TEXT NOT NULL
  REFERENCES auth(id)
  ON DELETE RESTRICT
```

- **userAuthId (TEXT)** mengacu ke **auth.id (TEXT/UUID)** di Better-Auth
- **ON DELETE RESTRICT**: Data bisnis tetap ada jika auth user dihapus (audit trail)
- **One-to-One**: Satu auth user hanya punya satu business profile

### 7.3 Cara Kerja Integration

**1. User Registration Flow**
```
1. User daftar → Better-Auth create user (email, password)
2. Admin buat Business Profile → UserProfile create (role, branch)
3. Hubungkan: userProfile.userAuthId = user.id
4. User bisa login dengan Business Profile
```

**2. User Login Flow**
```
1. User login → Better-Auth verify email/password
2. Get user.id dari Better-Auth
3. Find UserProfile by userAuthId
4. Return complete user data (auth + business)
```

**3. User Management**
```
1. Update Business Data → modify Profile (role, branch)
2. Update Auth Data → modify User (email, password)
3. Delete User → Better-Auth cascade delete, Profile restrict delete
```

### 7.4 Naming Convention

**Table Relations:**
```typescript
// Di Profile schema
auth: one(user, {         // ← nama: "auth user"
  fields: [profile.userAuthId],
  references: [user.id]
})

// Di Auth schema
profile: one(profile, {   // ← nama: "profile"
  fields: [user.id],
  references: [profile.userAuthId]
})
```

**Type Names:**
```typescript
UserWithProfile       = User + { profile?: UserProfile }
UserProfileWithAuth   = UserProfile + { authUser?: User }
UserWithAllRelations  = UserProfile + { authUser?, claims?, ... }
```

### 7.5 Validation Rules

**Database Level:**
- ✅ Foreign Key: `userAuthId` harus ada di user table
- ✅ Unique: `userAuthId` hanya boleh satu di profile table
- ✅ Not Null: `userAuthId` wajib diisi

**Application Level:**
- ✅ Auth User Exist: Cek user ada sebelum buat profile
- ✅ No Duplicate: Satu auth user hanya boleh satu profile
- ✅ Active Check: User harus active untuk create/update

**Business Rules:**
- ✅ Role Validation: Hanya role yang valid (ADMIN, CS, QRCC, MANAGEMENT)
- ✅ Soft Delete: User tidak benar-benar dihapus (isActive = false)

### 7.6 Service Layer (`server/services/userService.ts`)

**Validation Functions:**
- `validateAuthUserExists()` — cek user auth ada
- `validateBusinessProfileUnique()` — cek duplikat

**CRUD Operations:**
- `createUserProfile()` — buat profile bisnis
- `getUserByAuthId()` — ambil user dengan auth data
- `getAllUsers()` — ambil semua user dengan filter
- `updateUserProfile()` — update data bisnis
- `deactivateUserProfile()` — soft delete
- `reactivateUserProfile()` — aktifkan kembali

**Utility Functions:**
- `checkUserRole()` — cek role user
- `getUsersByRole()` — filter by role
- `getUsersByBranch()` — filter by branch

### 7.7 Usage Examples

```typescript
// Create User dengan Business Profile
const newUser = await createUserProfile({
  userAuthId: 'auth-user-123',  // ID dari Better-Auth
  name: 'John Doe',
  role: 'CS',
  branch: 'Jakarta',
  isActive: true
});

// Get User dengan Complete Data
const user = await getUserByAuthId('auth-user-123');
// Result: { id, name, role, authUser: { email, ... } }

// Update User Business Data
const updated = await updateUserProfile('auth-user-123', {
  role: 'QRCC',
  branch: 'Surabaya'
});
```

### 7.8 Performance Considerations

**Indexes:**
```sql
-- Di profile table
INDEX(userAuthId)   -- fast lookup by auth user
INDEX(role)          -- filter by role
INDEX(branch)        -- filter by branch
```

### 7.9 Security Measures

- **Foreign Key Constraints**: Tidak bisa insert `userAuthId` yang tidak ada
- **Restrict Delete**: Data bisnis tetap ada jika auth user dihapus
- **Unique Constraint**: Satu auth user hanya boleh satu profile
- **Role-Based Access**: Semua operasi cek role user
- **Soft Delete**: User tidak benar-benar dihapus → preserve audit trail

---