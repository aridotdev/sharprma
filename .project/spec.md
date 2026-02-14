# RMA CLAIM SYSTEM - FINAL SPECIFICATION DOCUMENT

> **Status**: FINALIZED & LOCKED ✅  
> **Last Update**: 2026-02-07  
> **Purpose**: Single source of truth untuk development

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Design](#database-design)
5. [Authentication & Authorization](#authentication--authorization)
6. [Business Logic & Flows](#business-logic--flows)
7. [API Endpoints Specification](#api-endpoints-specification)
8. [File Management](#file-management)
9. [Reports & Analytics](#reports--analytics)
10. [Development Guidelines](#development-guidelines)

---

## 1. PROJECT OVERVIEW

### 1.1 Tujuan Sistem

Membangun sistem internal RMA (Return Merchandise Authorization) Claim dengan:

- Alur CS → QRCC → Vendor
- Validasi foto & data berbasis vendor
- Audit trail lengkap
- Reporting & analytics

### 1.2 User Roles & Capabilities

| Role           | Capabilities    |
| -------------- | --------------- |
| **CS**         | Create & revisi claim, Upload foto, View status |
| **QRCC**       | Review & verify foto, Approve/reject claim, Generate vendor claim, Analytics & reports, CRUD master data |
| **MANAGEMENT** | View reports & analytics |
| **ADMIN**      | Full access + user management |

### 1.3 Target

- Internal company use
- Small user base (< 100 users)
- Ready for demo & production

---

## 2. TECH STACK

### 2.1 Core Stack (WAJIB)

```
Frontend & Backend: Nuxt 4
UI Components: Nuxt UI
Icons: iconify-json/lucide
Database: SQLite
ORM: Drizzle ORM
Language: TypeScript
Auth: Better-Auth
Validation: Zod
```

### 2.2 Utilities

```
Date/Time: date-fns
Charts: unovis/vue
Excel: xlsx
Image Processing: sharp
Environment: dotenv
Styling: tailwindcss
Linting: eslint
```

### 2.3 Commands

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

---

## 3. SYSTEM ARCHITECTURE

### 3.1 Folder Structure

```
project-root/
├── app
│   ├── assets/                 # main directory of the Nuxt application
│   ├── components/
│   ├── pages/
│   ├── composables/
│   ├── app.config.ts
│   └── app.vue
├── server/
│   ├── api/                    # API endpoints
│   │   ├── auth/               # Better-auth routes
│   │   ├── claims/             # Claim CRUD
│   │   ├── photos/             # Photo upload/review
│   │   ├── master/             # Master data endpoints
│   │   └── reports/            # Analytics & reports
│   ├── database/
│   │   ├── schema/             # Drizzle schemas
│   │   │   └── index.ts        # Export all
│   │   ├── migrations/         # Auto-generated
│   │   └── index.ts            # DB connection
│   ├── middleware/             # Auth, role checking
│   ├── repositories/           # DB operations
│   ├── services/               # Business logic
│   └── utils/                  # Helpers, validators
├── shared/                     # Shared between client & server
│   ├── types/                  # TypeScript types
│   ├── constants/              # Enums, configs
│   └── schemas/                # Zod schemas
├── public/
│   └── uploads/
│       └── claims/             # Photo storage
│           ├── *.jpg           # Original photos
│           └── thumbs/         # Thumbnails
└── .docs/                      # Project documentation
```

### 3.2 Code Style Guidelines

- **Formatting**: 2-space indentation, LF line endings
- **Vue Components**: `<script setup lang="ts">` with Composition API
- **Imports**: Relative imports only - Vue/Nuxt → third-party → local
- **Database**: Drizzle ORM with SQLite
- **Validation**: Zod schema validation untuk semua API routes
- **Error Handling**: `createError()` with proper status codes
- **File Naming**: PascalCase for components, camelCase for utils/composables
- **Testing**: Vitest with `.test.ts`, `.spec.ts` suffixes

### 3.3 Separation of Concerns

| Layer      | Tanggung Jawab                   | Tidak Boleh                   | Folder                         |
| ---------- | -------------------------------- | ----------------------------- | ------------------------------ |
| API Route  | HTTP, Auth, Validasi input dasar | Business logic, Query DB      | server/api/\*                  |
| Service    | Business logic, Koordinasi       | Query DB langsung, HTTP stuff | server/services/\*.service.ts  |
| Repository | CRUD database                    | Business logic, Auth          | server/repositories/\*.repo.ts |

---

## 4. DATABASE DESIGN

### 4.1 Design Principles

- **Timestamp Format**: `integer` (Unix miliseconds) with Drizzle `mode: 'timestamp_ms'`
- **Boolean Format**: `integer` with Drizzle `mode: 'boolean'` (0/1 → true/false)
- **Enum Format**: `text` + Zod validation (no DB enum)
- **Soft Delete Strategy**: Use flags/status instead of actual deletion
- **Foreign Keys**: All integer type
- **Audit Trail**: Append-only history log

### 4.2 Timestamp Implementation

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

### 4.3 Cascade Delete Strategy

#### Vendor (Soft Delete)

```
Strategy: isActive flag
- Vendor tidak benar-benar dihapus
- isActive = false untuk non-aktifkan
- Semua relasi TIDAK PERLU onDelete
- Data historis tetap utuh
```

#### User (Soft Delete)

```
Strategy: isActive flag
- User tidak benar-benar dihapus
- isActive = false untuk non-aktifkan
- Semua relasi TIDAK PERLU onDelete
- Data historis tetap utuh
- User non-aktif tidak bisa login
```

#### Claim (Soft Delete via Status)

```
Strategy: claimStatus = 'ARCHIVED'
- Claim tidak benar-benar dihapus
- "Hapus claim" = ubah status jadi ARCHIVED
- Semua relasi TIDAK PERLU onDelete
- Claim ARCHIVED tidak muncul di list aktif
- Audit trail tetap lengkap
```

### 4.4 Master Tables

#### 4.4.1 Vendor

| Kolom     | Tipe    | Constraint       | Keterangan       |
| --------- | ------- | ---------------- | ---------------- |
| id        | integer | PK               | ID vendor        |
| name      | text    | NOT NULL, UNIQUE | Nama vendor      |
| isActive  | integer | NOT NULL         | Boolean          |
| createdBy | integer | NOT NULL         | ID user          |
| updatedBy | integer | NOT NULL         | ID user          |
| createdAt | integer | NOT NULL         | Waktu dibuat     |
| updatedAt | integer | NOT NULL         | Waktu ada update |

INDEX :

- UNIQUE (name)

📌 CATATAN PENTING : data awal vendor : `MOKA`, `MTC`, `SDP`
📌 CATATAN: Vendor menggunakan soft delete (isActive flag)

#### 4.4.2 ProductModel

| Kolom     | Tipe    | Constraint       | Keterangan       |
| --------- | ------- | ---------------- | ---------------- |
| id        | integer | PK               | ID product model |
| name      | text    | NOT NULL, UNIQUE | Nama product     |
| inch      | integer | NOT NULL         | Ukuran layar     |
| vendorId  | integer | FK -> vendor.id  | ID vendor        |
| isActive  | integer | NOT NULL         | Boolean          |
| createdBy | integer | FK -> profile.id | ID user          |
| updatedBy | integer | FK -> profile.id | ID user          |
| createdAt | integer | NOT NULL         | Waktu dibuat     |
| updatedAt | integer | NOT NULL         | Waktu ada update |

INDEX :

- UNIQUE (name)
- INDEX (vendorId)

📌 CATATAN: ProductModel menggunakan soft delete (isActive flag)

---

#### 4.4.2 ProductModel

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

INDEX :

- UNIQUE (name)
- INDEX (vendorId)

#### 4.4.3 NotificationRef

| Kolom            | Tipe    | Constraint                            | Keterangan                          |
| ---------------- | ------- | ------------------------------------- | ----------------------------------- |
| id               | integer | PK                                    | ID notificatin ref                  |
| notificationCode | text    | UNIQUE                                | Kode notifikasi                     |
| notificationDate | integer | NOT NULL                              | Tanggal notifikasi (Unix timestamp) |
| modelName        | text    | NOT NULL                              | Nama model                          |
| branch           | text    | NOT NULL                              | Cabang CS                           |
| vendorId         | integer | FK -> vendor.id onDelete: 'restrict'  | Kode vendor                         |
| status           | text    | NOT NULL                              | NEW / USED / EXPIRED                |
| createdBy        | integer | FK -> profile.id onDelete: 'restrict' | dibuat oleh                         |
| updatedBy        | integer | FK -> profile.id onDelete: 'restrict' | diupdate oleh                       |
| createdAt        | integer | NOT NULL                              | Waktu dibuat                        |
| updatedAt        | integer | NOT NULL                              | Waktu diupdate                      |

INDEX :

- UNIQUE (notificationCode)
- INDEX (vendorId)
- INDEX (notificationDate)
- INDEX (status)

#### 4.4.4 VendorPhotoRule

| Kolom      | Tipe    | Constraint                            | Keterangan         |
| ---------- | ------- | ------------------------------------- | ------------------ |
| id         | integer | PK                                    | ID VendorPhotoRule |
| vendorId   | integer | FK -> vendor.id onDelete: 'restrict'  | Kode vendor        |
| photoType  | text    | NOT NULL                              |                    |
| isRequired | integer | NOT NULL                              | Boolean            |
| createdBy  | integer | FK -> profile.id onDelete: 'restrict' | dibuat oleh        |
| updatedBy  | integer | FK -> profile.id onDelete: 'restrict' | diupdate oleh      |
| createdAt  | integer | NOT NULL                              | Waktu dibuat       |
| updatedAt  | integer | NOT NULL                              | Waktu ada update   |

INDEX :

- UNIQUE (vendorId, photoType)
- INDEX (vendorId)

📌 Validasi ENUM -> backend/Zod CLAIM / CLAIM_ZOOM / ODF / PANEL_SN / WO_PANEL / WO_PANEL_SN

📌 Panduan :
| photoType | MOKA | MTC | SDP |
| ----------- | ---- | --- | --- |
| CLAIM | ✅ | ✅ | ✅ |
| CLAIM_ZOOM | ✅ | ✅ | ✅ |
| ODF | ✅ | ✅ | ✅ |
| PANEL_SN | ✅ | ✅ | ✅ |
| WO_PANEL | ✅ | ❌ | ❌ |
| WO_PANEL_SN | ✅ | ❌ | ❌ |

#### 4.4.5 VendorFieldRule

| Kolom      | Tipe    | Constraint                            | Keterangan                 |
| ---------- | ------- | ------------------------------------- | -------------------------- |
| id         | integer | PK                                    | ID VendorFieldRule         |
| vendorId   | integer | FK --> vendor.id onDelete: 'restrict' | Kode vendor                |
| fieldName  | text    | NOT NULL                              | odfNumber / version / week |
| isRequired | integer | NOT NULL                              | Boolean                    |
| createdBy  | integer | FK -> profile.id onDelete: 'restrict' | dibuat oleh                |
| updatedBy  | integer | FK -> profile.id onDelete: 'restrict' | diupdate oleh              |
| createdAt  | integer | NOT NULL                              | Waktu dibuat               |
| updatedAt  | integer | NOT NULL                              | Waktu ada update           |

INDEX :

- UNIQUE (vendorId, fieldName)
- INDEX (vendorId)

📌 Panduan :
| No | Field Name |MOKA |MTC |SDP |
|----| ---------- |---- |--- |----|
| 1 | odfNumber | ✅ |❌ | ❌ |
| 2 | version | ✅ |❌ | ❌ |
| 3 | week | ✅ |❌ | ❌ |

#### 4.4.6 DefectMaster

| Kolom     | Tipe    | Constraint                            | Keterangan       |
| --------- | ------- | ------------------------------------- | ---------------- |
| id        | integer | PK                                    | ID DefectMaster  |
| name      | text    | NOT NULL, UNIQUE                      | nama defect      |
| isActive  | integer | NOT NULL                              | Boolean          |
| createdBy | integer | FK -> profile.id onDelete: 'restrict' | dibuat oleh      |
| updatedBy | integer | FK -> profile.id onDelete: 'restrict' | diupdate oleh    |
| createdAt | integer | NOT NULL                              | Waktu dibuat     |
| updatedAt | integer | NOT NULL                              | Waktu ada update |

INDEX :

- UNIQUE (name)
