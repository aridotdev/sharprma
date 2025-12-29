 RMA Claim System

## STATUS AKHIR
Dokumen ini menjadi **single source of truth** untuk
melanjutkan development.

------------------------------------------------------------------------

## A. TUJUAN SISTEM

Membangun sistem internal RMA Claim dengan: - Alur CS → QRCC → Vendor -
Validasi foto & data berbasis vendor - Audit trail lengkap - Reporting &
analytics

------------------------------------------------------------------------

## B. ROLE & CAPABILITY

### CS

-   Membuat & merevisi claim
-   Upload foto
-   Melihat status

### QRCC

-   Review & verifikasi foto
-   Approve / reject claim
-   Generate vendor claim
-   Analytics & dashboard

### MANAGEMENT

-   Melihat laporan & analytics

### ADMIN

-   Akses penuh

------------------------------------------------------------------------

## C. ALUR UTAMA SISTEM

### 🧭 ALUR CS — FORM CLAIM RMA (Claim Internal) 

🟢 **KONDISI AWAL**
- CS sudah login
- Role = CS
- CS membuka menu “Buat Klaim Baru”

#### 1. CS Klik tombol "Buat Klaim RMA Baru"
  - Membuka halaman Klaim RMA Baru dan menampilkan Input kosong `Notification Code`
#### 2. CS Mengisi informasi awal
  **A. Cara 1 - mengisi Notification Code**
  - CS mengisi field notification
  - CS klik enter untuk Cari / Validasi
  - Sistem melakukan :
    - Lookup ke tabel `NotificationRef`
    - Berdasarkan notication code yang sudah diinput.
  - Hasil Lookup Notification
    - Jika Notification DITEMUKAN ✅, Masuk ke halaman input data step 1. sistem akan:
      - Mengisi otomatis:
        - `notification` → dari input CS
        - `modelName` → dari `NotificationRef`
        - `vendorId` → dari `NotificationRef`
      - Lanjut lookup ke ProductModel, mengisi otomatis:
        - `inch` → dari `ProductModel`

    📌 Field berikut menjadi read-only: `notification`, `modelName`, `vendorId`, `inch`
    - Jika Notification TIDAK DITEMUKAN ❌
      - Sistem Menampilkan pesan: **“Notification tidak ditemukan”**
      - membuka halaman input nama model

  **B. Cara 2 - mengisi nama model**
  - CS mengisi field nama model
  - CS klik enter untuk cari / validasi
  - Sistem melakukan :
    - Lookup ke tabel `ProductModel`
  - Hasil lookup nama model
    - Jika nama model DITEMUKAN ✅, Masuk ke halaman input data step 1. sistem akan:
      - Mengisi otomatis:
        - `modelName` → dari input CS
        - `vendorId` → dari `ProductModel`
        - `inch` → dari `ProductModel`
  
    📌 Field berikut menjadi read-only: `modelName`, `vendorId`, `inch`

#### 3. CS Mengisi data klaim
  **A. Step-1**
  
  Status awal klaim = `DRAFT`, belum ada data yang disimpan permanen

  CS mengisi field berikut:
    - `panelSerialNo`
    - `OcSerialNo`
    - `defect`

  Field kondisional (berdasarkan `VendorFieldRule`):
  - `OdfNumber` → wajib Vendor 1
  - `version` → wajib Vendor 1
  - `week` → wajib Vendor 1



  📌 Validasi berdasarkan VendorFieldRule

  **B. Step-2**

  CS Upload Foto Klaim. Jenis Foto (ClaimPhoto.photoType). dengan cara form step (ada indikator).

Sistem menentukan foto wajib berdasarkan `VendorPhotoRule`:

| STEP   | Photo Type  | MOKA     |  MTC        |  SDP       |
| ------ | ----------  | -------- |  --------   |  --------  |
| 1      | Claim       | ✅       |  ✅         |  ✅        |
| 2      | CLAIM_ZOOM  | ✅       |  ✅         |  ✅        |
| 3      | ODF         | ✅       |  ✅         |  ✅        |
| 4      | PANEL_SN    | ✅       |  ✅         |  ✅        |
| 5      | WO_PANEL    | ✅       |  ❌         |  ❌        |
| 6      | WO_PANEL_SN | ✅       |  ❌         |  ❌        |

📌 Semua foto:

Status awal = `PENDING`

Bisa di-upload ulang selama belum `APPROVED`


#### 4. CS Submit Klaim

**Sistem melakukan validasi:**
1. Semua field wajib vendor terisi
2. Semua foto wajib vendor sudah di-upload
3. Tidak ada error format

**Jika valid:**
- Claim disimpan
- `claimStatus` → `SUBMITTED`
- Record ClaimHistory dibuat:
  - action = `SUBMIT`
  - actorRole = `CS`

#### 5. CS Menunggu Review QRCC

**Setelah submit:**
1. CS tidak bisa edit data
2. CS hanya bisa:
     - Melihat status klaim
     - Melihat status foto

#### 6. Jika Klaim NEED_REVISION

(hasil review QRCC)

**Sistem:**
-  Mengubah `claimStatus` → `NEED_REVISION`
-  Menandai foto dengan status `REJECT`

**CS BISA:**
- Melihat catatan QRCC
- Upload ulang hanya foto yang `REJECT`
- Revisi data jika diminta

**Setelah revisi:**
- CS klik Submit Revisi
- `claimStatus` → `SUBMITTED`
- ClaimHistory dicatat

#### 7. Jika Klaim APPROVED
- Semua foto `VERIFIED`
- Klaim tidak bisa diubah lagi oleh CS
- Klaim siap diproses ke vendor (alur QRCC)

📌 Peran CS SELESAI di sini

**🔒 RANGKUMAN STATUS CS**
| **Status Klaim**  | **Aksi CS**     |
| ------------      | -----------     |
| DRAFT       	    | Edit bebas      |
| SUBMITTED	        | Read-only       |
| NEED_REVISION	    | Edit terbatas   |
| APPROVED	        | Read-only       |
| CANCELLED	        | Tidak bisa edit |

### 2. Alur QRCC (QC)

   1. QRCC membuka daftar klaim `SUBMITTED`
   2. QRCC mulai review → `claimStatus` = `IN_REVIEW`
   3. QRCC review foto satu per satu: `VERIFIED` / `REJECT` + note
   4. System re-calc status:
      - Ada `REJECT` → `NEED_REVISION`
      - Semua `VERIFIED` → `APPROVED`
   5. System mencatat ClaimHistory otomatis

### 3. Alur Vendor Claim

1.  QRCC filter claim `APPROVED` & belum diklaim
2.  Checklist claim per vendor
3.  Generate `VendorClaim` (batch)
4.  Vendor memberi keputusan per claim
5.  QRCC input `ACCEPTED` / `REJECTED` + kompensasi

------------------------------------------------------------------------

## D. DESAIN DATABASE
📌 CATATAN PENTING :
- Semua createdAt / updatedAt → text NOT NULL
- Semua enum → text + Zod, bukan enum DB. WAJIB import dari `shared/utils/constant.ts`
- Semua FK → integer
- TIDAK merubah dari desain yang sudah dibuat di file ini

### 1. Master Data
#### 1.1 **Vendor**
| Kolom     | Tipe    | Constraint        |  Keterangan     |
|---------  |---------|-------------------|-----------------|
|id         |	integer |	PK                |	ID vendor       |
|name       |	text    |	NOT NULL, UNIQUE  |	Nama vendor     |
|isActive   |	integer |	NOT NULL          |	Status akif     |
|createdAt  |	text    |	NOT NULL          |	Waktu dibuat    |
|updatedAt  |	text    |	NOT NULL          |	Waktu ada update|

#### 1.2 **ProductModel**
| Kolom     | Tipe    | Constraint        |  Keterangan                     |
|---------  |---------|-------------------|---------------------------------|
|id         |	integer |	PK                |	ID model           |
|vendorId   |	integer |	FK -> vendor.id   | Vendor             |
|modelName  |	text    |	NOT NULL          |	Nama Model         |
|inch       |	text    |	NOT NULL          |	Ukuran inch (fix)  |
|createdAt  |	text    |	NOT NULL          |	Waktu dibuat       |
|updatedAt  |	text    |	NOT NULL          |	Waktu ada update   |

INDEX :
- UNIQUE (modelName)
- INDEX (vendorId)

#### 1.3 **NotificationRef**
| Kolom             | Tipe    | Constrain        |  Keterangan           |
|-------------------|---------|-------------------|-----------------------|
|id                 |	integer |	PK                |	ID notificatin ref    |
|notificationCode   |	text    |	UNIQUE            | Kode notifikasi       |
|modelName          |	text    |	NOT NULL          |	Nama model            |
|vendorId           |	integer |	FK -> vendor.id   |	Kode vendor           |
|status             |	text    |	CHECK             |	NEW / USED / EXPIRED  |
|createdBy          |	integer |	FK -> user.id     |	Nama QRCC             |

#### 1.4 **VendorPhotoRule**
| Kolom             | Tipe    | Constraint        |  Keterangan           |
|-------------------|---------|-------------------|-----------------------|
|id                 |	integer |	PK                |	ID VendorPhotoRule    |
|vendorId           |	integer |	FK -> vendor.id   |	Kode vendor           |
|photoType          |	text    |	                  |                       |
|isRequired         |	integer |	NOT NULL          |	Wajib / tidak         |
|createdAt          |	text    |	NOT NULL          |	Waktu dibuat          |
|updatedAt          |	text    |	NOT NULL          |	Waktu ada update      |

INDEX :
- UNIQUE (vendorId, photoType)
- INDEX (vendorId)

📌 Validasi ENUM -> backend/Zod CLAIM / CLAIM_ZOOM / ODF / PANEL_SN / WO_PANEL / WO_PANEL_SN

#### 1.5 **VendorFieldRule**
| Kolom             | Tipe    | Constraint        |  Keterangan           |
|-------------------|---------|-------------------|-----------------------|
|id                 |	integer |	PK                |	ID VendorFieldRule    |
|vendorId           |	integer |	FK -> vendor.id   |	Kode vendor           |
|fieldName          |	text    |	CHECK             | odfNumber / version / week |
|isRequired         |	integer |	NOT NULL          |	Wajib / tidak         |
|createdAt          |	text    |	NOT NULL          |	Waktu dibuat          |
|updatedAt          |	text    |	NOT NULL          |	Waktu ada update      |

INDEX :
- UNIQUE (vendorId, fieldName)
- INDEX (vendorId)

📌 Panduan VendorFieldRule:
| No  | Field Name  | MOKA  | MTC  | SDP |
| ----| ----------  | ----- | ---- | ----|
| 1   | odfNumber   | ✅    | ❌   | ❌  |
| 2   | version     | ✅    | ❌   | ❌  |
| 3   | week        | ✅    | ❌   | ❌  |

### 2. Transaksi
#### 2.1 **Claim**
| Kolom             | Tipe    | Constraint        |  Keterangan           |
|-------------------|---------|-------------------|-----------------------|
|id                 |	integer |	PK                |	ID Klaim              |
|claimNumber        |	text    |	NOT NULL, UNIQUE  |	Kode Klaim            |
|notification       |	text    |	NOT NULL          |	Nomor Notifikasi      |
|modelName          |	text    |	NOT NULL          |	Nama model            |
|vendorId           |	integer |	FK -> vendor.id   |	Kode vendor           |
|inch               |	text    |	NOT NULL          |	Ukuran inch           |
|branch             |	text    |	NOT NULL          |	Nama cabang           |
|odfNumber          |	text    |	                  |	Nomor Odf             |
|panelSerialNo      |	text    |	NOT NULL          |	Nomor seri panel      |
|ocSerialNo         |	text    |	NOT NULL          |	Nomor seri oc         |
|defect             |	text    |	NOT NULL          |	Nama kerusakan        |
|version            |	text    |	                  |	Nomor versi           |
|week               |	text    |	                  |	Kode Week             |
|claimStatus        |	text    |	NOT NULL          |	Status Klaim          |
|submittedBy        |	integer |	FK -> user.id     |	Id CS                 |
|createdAt          |	text    |	NOT NULL          |	Waktu dibuat          |
|updatedAt          |	text    |	NOT NULL          |	Waktu ada update      |

INDEX :
- UNIQUE (claimNumber)
- INDEX (vendorId)
- INDEX (claimStatus)
- INDEX (submittedBy)
- INDEX (vendorId, claimStatus )

#### 2.2 **ClaimPhoto**
| Kolom             | Tipe    | Constraint        |  Keterangan           |
|-------------------|---------|-------------------|-----------------------|
|id                 |	integer |	PK                |	ID Klaim foto         |
|claimId            |	integer |	FK -> claim.id    |	Kode Klaim            |
|photoType          |	text    |	NOT NULL          | Tipe/nama foto        |
|filePath           |	text    |	NOT NULL          |	File path foto        |
|status             |	text    |	NOT NULL          |	Status foto           |
|reviewNote         |	text    |	                  |	Catatan review        |
|createdAt          |	text    |	NOT NULL          |	Waktu dibuat          |
|updatedAt          |	text    |	NOT NULL          |	Waktu ada update      |


#### 2.3 **VendorClaim**
| Kolom             | Tipe    | Constraint        |  Keterangan           |
|-------------------|---------|-------------------|-----------------------|
|id                 |	integer |	PK                |	ID vendor klaim       |
|vendorClaimNo      |	text    |	UNIQUE            |	No klaim vendor       |
|vendorId           |	integer |	FK -> vendor.id   |	Kode vendor           |
|submittedAt        |	text    |	NOT NULL          | Waktu kirim ke vendor |
|reportSnapshot     |	text    |	NOT NULL          |	json/file             |
|createdBy          |	integer |	FK -> user.id     |	Dibuat oleh           |
|createdAt          |	text    |	NOT NULL          |	Waktu dibuat          |
|updatedAt          |	text    |	NOT NULL          |	Waktu ada update      |


#### 2.4 **VendorClaimItem**
| Kolom             | Tipe    | Constraint            |  Keterangan           |
|-------------------|---------|-----------------------|-----------------------|
|id                 |	integer |	PK                    |	Id vendor klaim item  |
|vendorClaimId      |	integer |	FK -> vendorClaim.id  |	Id klaim vendor       |
|claimId            |	integer |	FK -> claim.id        |	Kode klaim            |
|vendorDecision     |	text    |	NOT NULL              | ACCEPTED / REJECTED   |
|compensationAmount |	integer |	                      |	wajib jika ACCEPTED   |
|note               |	text    |	                      |	Dibuat oleh           |
|decisionAt         |	text    | NOT NULL              |	Waktu decision vendor |


### 3. User & Audit
#### 3.1 **User**
| Kolom     | Tipe    | Constraint        |  Keterangan                     |
|---------  |---------|-------------------|---------------------------------|
|id         |	integer |	PK                |	ID user                         |
|userAuthId |	text    |	UNIQUE, NOT NULL  |	Auth id                         |
|name       |	text    |	NOT NULL          | Nama user                       |
|role       |	text    |	CHECK             |	ADMIN / CS / QRCC / MANAGEMENT  |
|isActive   |	integer |	NOT NULL          |	Status aktif                    |
|createdAt  |	text    | NOT NULL          |	Waktu dibuat                    |

INDEX :
- UNIQUE (userAuthId)
- INDEX (role)

#### 3.2 **ClaimHistory**
| Kolom     | Tipe    | Constraint        |  Keterangan        |
|---------  |---------|-------------------|--------------------|
|id         |	integer |	PK                |	ID klaim histori   |
|claimId    |	integer |	FK -> claim.id    | id claim           |
|action     |	text    |	NOT NULL          |	                   |
|fromStatus |	text    |	NOT NULL          |	status awal        |
|toStatus   |	text    |	NOT NULL          |	status akhir       |
|userId     |	integer |	FK -> user.id     |	ID User            |
|userRole   |	text    |	NOT NULL          |	snapshot           |
|note       |	text    |	                  |	catatan            |
|createdAt  |	text    | NOT NULL          |	Waktu dibuat       |


#### 3.3 **PhotoReview**
| Kolom         | Tipe    | Constraint            |  Keterangan         | 
|---------------|---------|-----------------------|---------------------|
|id             |	integer |	PK                    |	ID foto review      |
|claimPhotoId   |	integer |	FK -> claimPhoto.id   |	Kode Klaim          |
|reviewedBy     |	integer |	FK -> user.id         | Di review oleh      |
|status         |	text    |	NOT NULL              |	VERIFIED / REJECT   |
|note           |	text    |	                      |	Catatan reject      |
|reviewedAt     |	text    |	NOT NULL              |	Waktu review        |



------------------------------------------------------------------------

## E. PRINSIP DESAIN PENTING


-   Auth ≠ Business User
-   Master vs Snapshot Transaction
-   Append-only audit log
-   Vendor rules data-driven
-   Tidak hardcode logic vendor
-   DB ringan, logic di app layer
-   Relational Database (SQLite)

------------------------------------------------------------------------

## F. Tech Stack (WAJIB digunakan)
  1. Frontend & Backend: Nuxt 4
  2. UI: Nuxt UI
  3. Icons: iconify-json/lucide
  4. Database: SQLite
  5. ORM: Drizzle ORM
  6. Language: TypeScript
  7. Auth: better-auth
  8. Validation: Zod
  9. Utils : date-fns, unovis/vue, dotenv, tailwindcss, eslint

## G. Commands & Development Workflow
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run lint` - ESLint code checking
- `npm run typecheck` - TypeScript type validation
- `npm run test` - Run all tests (Vitest)
- `npm run test:unit filename.test.ts` - Run single test file
- `npm run test:coverage` - Generate test coverage report
- `npm run db:generate` - Generate database migrations (drizzle-kit generate)
- `npm run db:migrate` - Apply database migrations (drizzle-kit migrate)
- `npm run db:studio` - Database studio for development

## H. Code Style Guidelines
- **Formatting**: 2-space indentation, LF line endings, no trailing whitespace
- **Vue Components**: Use `<script setup lang="ts">` with Composition API
- **Imports**: Relative imports only - Vue/Nuxt → third-party → local
- **Database**: Drizzle ORM with SQLite, schemas in `/server/database/schema/`
- **Validation**: Gunakan Zod validation yang tepat untuk setiap tipe API route http request
- **Error Handling**: `createError()` with proper status codes in try/catch blocks
- **File Naming**: PascalCase for components, camelCase for utils/composables
- **Testing**: Vitest with `.test.ts` or `.spec.ts` suffixes in test files

## I. Cara Kerja
  1. Kerjakan bertahap & terstruktur
  2. Buatkan task list dulu sebelum memberikan penjelasan
  3. Gunakan bahasa yang mudah dipahami pemula, gunakan penjelasan singkat dan efektif
  4. Sertakan alasan teknis setiap keputusan
  5. lakukan review dahulu sebelum lanjut ke tahap berikutnya

## J. Tujuan Akhir
  1. menjadi aplikasi yang siap untuk di demokan.
  2. sudah lolos testing dan audit.
  3. aplikasi yang siap digunakan oleh tim dan user.

## K. Membangun Backend API Endpoints
- [x] Master Data API
- [ ] Transaksi API
- [ ] Photo API
- [ ] Notification API
- [ ] Auth API

## L. Implementation Progress

### Master Data API (Selesai: 2025-12-29)

| API | GET (List) | GET (ID) | POST | PUT | DELETE |
|-----|------------|----------|------|-----|--------|
| `/api/vendors` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/product-models` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/notification-refs` | ✅ | ✅ (code) | ✅ | ✅ | ✅ |
| `/api/vendor-field-rules` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/vendor-photo-rules` | ✅ | ✅ | ✅ | ✅ | ✅ |

### Transaction API (Selesai: 2025-12-29)

| API | GET (List) | GET (ID) | POST | PUT | DELETE |
|-----|------------|----------|------|-----|--------|
| `/api/claims` | ✅ | ✅ | ✅ | ✅ | ✅ |

### Database Schema (Selesai)
- [x] vendor.ts
- [x] product-model.ts
- [x] notification-ref.ts
- [x] vendor-field-rule.ts
- [x] vendor-photo-rule.ts
- [x] user.ts
- [x] claim.ts
- [x] claim-photo.ts
- [x] claim-history.ts
- [x] photo-review.ts
- [x] vendor-claim.ts
- [x] vendor-claim-item.ts

