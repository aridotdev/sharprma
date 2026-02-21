# RMA CLAIM SYSTEM - FINAL SPECIFICATION DOCUMENT

> **Status**: FINALIZED & LOCKED ✅  
> **Last Update**: 2026-02-22  
> **Purpose**: Single source of truth untuk development

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [User Role & Pages](#2-user-role-pages)
3. [Database Design](#3-database-design)
4. [Flow](#4-flow)
5. [Development Guideline](#5-development-guideline)
6. [Constants](#6-constants)
7. [User-Auth Integration](#7-user-auth-integration)

---

## 1. PROJECT OVERVIEW

refer to [1_project.md](1_project.md)

## 2. USER ROLE & PAGES

refer to [2_user-and-role-pages.md](2_user-and-role-pages.md)

---

## 3. DATABASE DESIGN

### 3.1 Design Principles

- **Timestamp Format**: `integer` (Unix miliseconds) with Drizzle `mode: 'timestamp_ms'`
- **Boolean Format**: `integer` with Drizzle `mode: 'boolean'` (0/1 → true/false)
- **Enum Format**: `text` + Zod validation (no DB enum)
- **Soft Delete Strategy**: Use flags/status instead of actual deletion
- **Foreign Keys**: All integer type
- **Audit Trail**: Append-only history log

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

#### Vendor (Soft Delete)

```
Strategy: isActive flag
- Vendor tidak benar-benar dihapus
- isActive = false untuk non-aktifkan
- Data historis tetap utuh
```

#### User (Soft Delete)

```
Strategy: isActive flag
- User tidak benar-benar dihapus
- isActive = false untuk non-aktifkan
- Data historis tetap utuh
- User non-aktif tidak bisa login
```

#### Claim (Soft Delete via Status)

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

INDEX :
- INDEX (isActive)
- INDEX (createdAt)
- UNIQUE (code)

📌 CATATAN PENTING : 
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

INDEX :
- UNIQUE (name, vendorId)
- INDEX (vendorId)
- INDEX (isActive)
- INDEX (createdAt)
- INDEX (vendorId, isActive)

#### 3.4.3 NotificationMaster

| Kolom            | Tipe    | Constraint                               | Keterangan                          |
| ---------------- | ------- | ---------------------------------------- | ----------------------------------- |
| id               | integer | PK                                       | ID notificatin ref                  |
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

INDEX :

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

INDEX :

- UNIQUE (name)
- INDEX (isActive)
- INDEX (createdAt)

---

### 3.5 Transaction Table

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

INDEX :

- UNIQUE (claimNumber)
- INDEX (vendorId)
- INDEX (claimStatus)
- INDEX (submittedBy)
- INDEX (vendorId, claimStatus )

📌 CATATAN PENTING :

- Generate claimNumber (CL-{YYYYMMDD}-{Sequence}).
- branch snapshot dari profile.branch || notificationMaster.branch
- CLAIM_STATUSES = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'NEED_REVISION', 'APPROVED', 'ARCHIVED']
- Claim menggunakan soft delete via claimStatus = ARCHIVED

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

INDEX :

- UNIQUE (claimId, photoType)
- INDEX (claimId)

Photo Upload API

- File Storage: ./public/uploads/claims/
- Ensure directory creation.
- Unique filename generation: {claimId}_{photoType}_{timestamp}.jpg.
- Nuxt/H3: Use readMultipartFormData.
- Tambahkan Validasi File :
  const ALLOWED*TYPES = ['image/jpeg', 'image/png']
  const MAX_SIZE = 5 * 1024 \_ 1024 // 5MB

  // Server-side validation
  if (!ALLOWED_TYPES.includes(file.type)) {
  throw createError({ statusCode: 400, message: 'Invalid file type' })
  }

- Tambahkan Security
  // Jangan trust user input untuk path
  const sanitizedFilename = `${claimId}_${photoType}_${Date.now()}.jpg`
  const safePath = join(UPLOAD_DIR, sanitizedFilename)

  // Prevent directory traversal
  if (!safePath.startsWith(UPLOAD_DIR)) {
  throw createError({ statusCode: 400, message: 'Invalid path' })
  }

- Tambahkan Thumbnail generation (library sharp node.js)
- Thumbnail size 300x300px
- enum photoType = ["CLAIM", "CLAIM_ZOOM", "ODF", "PANEL_SN", "WO_PANEL", "WO_PANEL_SN"]
- enum status = ['PENDING', 'VERIFIED', 'REJECT'] (default: 'PENDING')

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

📌 CATATAN PENTING :

- enum status ['DRAFT', 'CREATED', 'PROCESSING', 'COMPLETED']
- Generate vendorClaimNo (VC-{YYYYMMDD}-{Sequence}).

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

📌 CATATAN PENTING :

- enum vendorDecision ['PENDING', 'ACCEPTED', 'REJECTED']
- `rejectReason` wajib diisi jika vendorDecision = REJECTED

---

#### 3.5.5 ClaimHistory

| Kolom      | Tipe    | Constraint                            | Keterangan       |
| ---------- | ------- | ------------------------------------- | ---------------- |
| id         | integer | PK                                    | ID klaim histori |
| claimId    | integer | FK -> claim.id onDelete: 'restrict'   | id claim         |
| action     | text    | NOT NULL                              |                  |
| fromStatus | text    | NOT NULL                              | status awal      |
| toStatus   | text    | NOT NULL                              | status akhir     |
| userId     | integer | FK -> profile.id onDelete: 'restrict' | ID User          |
| userRole   | text    | NOT NULL                              | snapshot         |
| note       | text    |                                       | catatan          |
| createdAt  | integer | NOT NULL                              | Waktu dibuat     |

INDEX :

- INDEX (claimId)
- INDEX (userId)

📌 CATATAN PENTING :
- enum action merujuk pada CLAIM_HISTORY_ACTIONS di 6_constants.md

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

INDEX :

- INDEX (claimPhotoId)
- INDEX (reviewedBy)

📌 CATATAN PENTING :
- enum status merujuk pada CLAIM_PHOTO_STATUSES di 6_constants.md

---

### 3.6 User Table

#### 3.6.1 Profile (user business)

| Kolom      | Tipe    | Constraint       | Keterangan     |
| ---------- | ------- | ---------------- | -------------- |
| id         | integer | PK               | ID user        |
| userAuthId | text    | UNIQUE, NOT NULL | Auth id        |
| name       | text    | NOT NULL         | Nama user      |
| role       | text    | NOT NULL         | enum role      |
| branch     | text    |                  | branch         |
| isActive   | integer | NOT NULL (0/1)   | Boolean        |
| createdAt  | integer | NOT NULL         | Waktu dibuat   |
| updatedAt  | integer | NOT NULL         | Waktu diupdate |

INDEX :
- UNIQUE (userAuthId)
- INDEX (role)

📌 CATATAN PENTING : 
- enum role ['ADMIN', 'CS', 'QRCC', 'MANAGEMENT']
- User menggunakan soft delete (isActive flag)
- Branch bisa di-update, claim menyimpan snapshot branch

User tidak akan benar-benar dihapus dari database
Gunakan flag isActive: boolean untuk non-aktifkan
Semua relasi (Claim.submittedBy, ClaimHistory.userId, dll) TIDAK PERLU onDelete: 'restrict'
User yang isActive = false tidak bisa login, tapi data historis tetap utuh

---

#### 3.6.2 Auth (Better Auth)

Schema dibuatkan otomatis oleh Better-Auth dengan fitur:

- Email & Password authentication
- Username plugin (display name)
- Admin plugin
- session management :
  - expire : 7 hari
  - ratelimit : true
  - max attempt : 5 kali
  - lock duration : 15 menit

---

## 4. Flow

### 4.1 Flow CS

refer to [3_alur-sistem-cs.md](3_alur-sistem-cs.md)

### 4.2 Flow QRCC

refer to [4_alur-sistem-qrcc.md](4_alur-sistem-qrcc.md)

---

## 5. Development Guideline

refer to [5_development-guideline.md](5_development-guideline.md)

---

## 6. Constants

refer to [6_constants.md](6_constants.md)

---

## 7. User-Auth Integration

refer to [7_user-auth-integration.md](7_user-auth-integration.md)
