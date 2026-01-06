# Fix: Pemindahan Field `branch` dari Claim ke NotificationRef

## 📋 Ringkasan Perubahan

Memindahkan field `branch` dari table `claim` ke table `notification_ref` sesuai dengan requirement bisnis bahwa satu notification hanya milik satu branch.

**Tanggal:** 2025-01-05  
**Status:** Selesai (desain database & API)  
**Migration:** Belum di-generate (sesuai request)

---

## 🔍 Alasan Perubahan

### Requirement Bisnis
- Satu notification code hanya milik satu branch
- Data branch bersifat master/reference di level notification
- Menghindari inkonsistensi data branch per claim

### Dampak ke Sistem
- Branch menjadi data referensi di notification
- Claim tidak perlu menyimpan branch secara redundant
- Simplifikasi query & maintenance data

---

## 📊 Perubahan Database Schema

### 1. `server/database/schema/notification-ref.ts`

**Menambahkan field `branch`:**
```typescript
export const notificationRef = sqliteTable('notification_ref', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  notificationCode: text('notification_code').notNull().unique(),
  modelName: text('model_name').notNull(),
  vendorId: integer('vendor_id').references(() => vendor.id, { onDelete: 'restrict' }).notNull(),
  status: text('status').notNull().default('NEW'),
  branch: text('branch').notNull(),  // ✅ DITAMBAHKAN
  createdBy: integer('created_by').references(() => userRma.id).notNull()
})
```

**Update Zod Validation:**
```typescript
export const insertNotificationRefSchema = createInsertSchema(notificationRef, {
  notificationCode: z.string().min(1, 'Notification code is required').max(25, 'Notification code must be less than 25 characters').trim().toUpperCase(),
  modelName: z.string().min(1, 'Model name is required').max(25, 'Model name must be less than 25 characters').trim(),
  branch: z.string().min(1, 'Branch is required').max(50, 'Branch must be less than 50 characters').trim(),  // ✅ DITAMBAHKAN
  vendorId: z.number().int().positive('Vendor ID must be a positive integer'),
  status: z.enum(NOTIFICATION_STATUSES).default('NEW'),
  createdBy: z.number().int().positive('Created by user ID must be a positive integer')
}).omit({
  id: true
})
```

### 2. `server/database/schema/claim.ts`

**Menghapus field `branch`:**
```typescript
export const claim = sqliteTable('claim', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  claimNumber: text('claim_number').notNull().unique(),
  notification: text('notification').notNull(),
  modelName: text('model_name').notNull(),
  vendorId: integer('vendor_id').references(() => vendor.id, { onDelete: 'restrict' }).notNull(),
  inch: text('inch').notNull(),
  // ❌ branch: text('branch').notNull(),  // DIHAPUS
  odfNumber: text('odf_number'),
  panelSerialNo: text('panel_serial_no').notNull(),
  ocSerialNo: text('oc_serial_no').notNull(),
  defect: text('defect').notNull(),
  version: text('version'),
  week: text('week'),
  claimStatus: text('claim_status').notNull().default('DRAFT'),
  submittedBy: integer('submitted_by').references(() => userRma.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})
```

**Update Zod Validation:**
```typescript
export const insertClaimSchema = createInsertSchema(claim, {
  claimNumber: z.string().min(1, 'Claim number is required').max(50, 'Claim number must be less than 50 characters'),
  notification: z.string().max(50, 'Notification must be less than 50 characters').trim().default(''),
  modelName: z.string().min(1, 'Model name is required').max(100, 'Model name must be less than 100 characters').trim(),
  vendorId: z.number().int().positive('Vendor ID must be a positive integer'),
  inch: z.string().min(1, 'Inch size is required').max(5, 'Inch size must be less than 5 characters'),
  // ❌ branch validation dihapus
  odfNumber: z.string().max(50, 'ODF number must be less than 50 characters').trim().optional(),
  panelSerialNo: z.string().min(1, 'Panel serial number is required').max(50, 'Panel serial number must be less than 50 characters').trim(),
  ocSerialNo: z.string().min(1, 'OC serial number is required').max(50, 'OC serial number must be less than 50 characters').trim(),
  defect: z.string().min(1, 'Defect description is required').max(100, 'Defect description must be less than 100 characters').trim(),
  version: z.string().max(20, 'Version must be less than 20 characters').trim().optional(),
  week: z.string().max(10, 'Week must be less than 10 characters'),
  claimStatus: z.enum(CLAIM_STATUSES, {
    message: 'Claim status must be one of: DRAFT, SUBMITTED, IN_REVIEW, NEED_REVISION, APPROVED, CANCELLED'
  }).default('DRAFT'),
  submittedBy: z.number().int().positive('Submitted by user ID must be a positive integer').optional()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
})
```

---

## 🔌 Perubahan API Endpoints

### 1. Notification Refs API

#### POST `/api/notification-refs`
**Perubahan:**
- Body request sekarang **wajib** menyertakan field `branch`
- Validation error jika `branch` tidak diisi atau melebihi 50 karakter

**Example Request:**
```json
{
  "notificationCode": "NOTIF-001",
  "modelName": "MODEL-X1",
  "vendorId": 1,
  "branch": "JAKARTA",
  "status": "NEW",
  "createdBy": 1
}
```

---

#### PUT `/api/notification-refs/:id`
**Perubahan:**
- **DISABLED**: Tidak bisa mengupdate field `branch` setelah notification dibuat
- Update schema menggunakan `.omit({ branch: true })`
- Validasi tambahan: throw error jika body mengandung field `branch`

**Example Response Error:**
```json
{
  "statusCode": 400,
  "statusMessage": "Branch cannot be updated"
}
```

**Code Changes:**
```typescript
// Update schema (partial) - branch cannot be updated
const updateSchema = insertNotificationRefSchema.partial().omit({ branch: true })

// Additional check
if ('branch' in rawBody) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Branch cannot be updated'
  })
}
```

---

#### GET `/api/notification-refs`
**Perubahan:**
- Response sekarang **include** field `branch`

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "notificationCode": "NOTIF-001",
      "modelName": "MODEL-X1",
      "vendorId": 1,
      "vendorName": "MOKA",
      "branch": "JAKARTA",  // ✅ DITAMBAHKAN
      "status": "NEW",
      "createdBy": 1
    }
  ]
}
```

---

#### GET `/api/notification-refs/:code`
**Perubahan:**
- Response sekarang **include** field `branch`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "notificationCode": "NOTIF-001",
    "modelName": "MODEL-X1",
    "vendorId": 1,
    "vendorName": "MOKA",
    "branch": "JAKARTA",  // ✅ DITAMBAHKAN
    "status": "NEW",
    "createdBy": 1
  }
}
```

---

### 2. Claims API

#### POST `/api/claims`
**Perubahan:**
- **VALIDASI**: Body request **tidak boleh** menyertakan field `branch`
- **LOGIC**: Branch akan diambil dari `notificationRef.branch` jika notificationCode diisi

**Validation:**
```typescript
// Validate that branch is not in body (auto-filled)
if ('branch' in rawBody) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Branch is auto-filled and cannot be provided'
  })
}
```

**Example Request:**
```json
{
  "claimNumber": "CLAIM-001",
  "notification": "NOTIF-001",
  "modelName": "MODEL-X1",
  "vendorId": 1,
  "inch": "55",
  "panelSerialNo": "PANEL-001",
  "ocSerialNo": "OC-001",
  "defect": "Dead pixel",
  "version": "V1.0",
  "week": "W1"
}
```

**Note:** Field `branch` **tidak** diisi karena otomatis diambil dari notification.

---

#### GET `/api/claims`
**Perubahan:**
- Response sekarang **join** dengan `notificationRef` untuk mendapatkan field `branch`
- Branch diambil dari `notificationRef.branch`

**Code Changes:**
```typescript
const result = await db
  .select({
    id: claim.id,
    claimNumber: claim.claimNumber,
    notification: claim.notification,
    modelName: claim.modelName,
    vendorId: claim.vendorId,
    vendorName: vendor.name,
    inch: claim.inch,
    branch: notificationRef.branch,  // ✅ DITAMBAHKAN (join)
    tglKlaim: claim.createdAt,
    status: claim.claimStatus,
    submittedBy: claim.submittedBy,
    submittedByName: user.name,
    updatedAt: claim.updatedAt
  })
  .from(claim)
  .leftJoin(notificationRef, eq(claim.notification, notificationRef.notificationCode))  // ✅ DITAMBAHKAN
  .leftJoin(vendor, eq(claim.vendorId, vendor.id))
  .leftJoin(user, eq(claim.submittedBy, user.id))
  .where(and(...conditions))
  .orderBy(desc(claim.createdAt))
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "claimNumber": "CLAIM-001",
      "notification": "NOTIF-001",
      "modelName": "MODEL-X1",
      "vendorId": 1,
      "vendorName": "MOKA",
      "inch": "55",
      "branch": "JAKARTA",  // ✅ DARI notificationRef
      "tglKlaim": "2025-01-05T10:00:00.000Z",
      "status": "DRAFT",
      "submittedBy": 1,
      "submittedByName": "John Doe",
      "updatedAt": "2025-01-05T10:00:00.000Z"
    }
  ]
}
```

---

#### GET `/api/claims/:id`
**Perubahan:**
- Response sekarang **join** dengan `notificationRef` untuk mendapatkan field `branch`
- Branch diambil dari `notificationRef.branch`

**Code Changes:**
```typescript
const result = await db
  .select({
    id: claim.id,
    claimNumber: claim.claimNumber,
    notification: claim.notification,
    modelName: claim.modelName,
    vendorId: claim.vendorId,
    vendorName: vendor.name,
    inch: claim.inch,
    branch: notificationRef.branch,  // ✅ DITAMBAHKAN (join)
    odfNumber: claim.odfNumber,
    panelSerialNo: claim.panelSerialNo,
    ocSerialNo: claim.ocSerialNo,
    defect: claim.defect,
    version: claim.version,
    week: claim.week,
    claimStatus: claim.claimStatus,
    submittedBy: claim.submittedBy,
    submittedByName: user.name,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt
  })
  .from(claim)
  .leftJoin(notificationRef, eq(claim.notification, notificationRef.notificationCode))  // ✅ DITAMBAHKAN
  .leftJoin(vendor, eq(claim.vendorId, vendor.id))
  .leftJoin(user, eq(claim.submittedBy, user.id))
  .where(eq(claim.id, params.id))
  .limit(1)
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "claimNumber": "CLAIM-001",
    "notification": "NOTIF-001",
    "modelName": "MODEL-X1",
    "vendorId": 1,
    "vendorName": "MOKA",
    "inch": "55",
    "branch": "JAKARTA",  // ✅ DARI notificationRef
    "odfNumber": "ODF-001",
    "panelSerialNo": "PANEL-001",
    "ocSerialNo": "OC-001",
    "defect": "Dead pixel",
    "version": "V1.0",
    "week": "W1",
    "claimStatus": "DRAFT",
    "submittedBy": 1,
    "submittedByName": "John Doe",
    "createdAt": "2025-01-05T10:00:00.000Z",
    "updatedAt": "2025-01-05T10:00:00.000Z",
    "history": []
  }
}
```

---

#### PUT `/api/claims/:id`
**Perubahan:**
- Body request **tidak boleh** menyertakan field `branch`
- Update schema otomatis exclude `branch` karena sudah dihapus dari `insertClaimSchema`

---

## 🔧 Helper Functions

### 1. `server/utils/auth.ts`

**Menambahkan import:**
```typescript
import { userRma } from '../database/schema'
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
```

**Menambahkan function `getCurrentUserBranch`:**
```typescript
/**
 * Get current user's branch from auth session
 * @param event - H3 event from request handler
 * @returns User's branch string
 * @throws Error if not authenticated or user not found
 */
export async function getCurrentUserBranch(event: H3Event): Promise<string> {
  const session = await auth.api.getSession({ headers: event.headers })
  
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - No active session'
    })
  }
  
  const user = await db
    .select({ branch: userRma.branch })
    .from(userRma)
    .where(eq(userRma.userAuthId, session.user.id))
    .limit(1)
  
  if (!user[0]) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found in business user table'
    })
  }
  
  return user[0].branch
}
```

**Catatan:** Function ini dibuat untuk masa depan, namun **belum dipakai** di POST `/api/claims` karena implementasi saat ini hanya mengambil branch dari `notificationRef`.

---

## 📦 Migration Plan

### Migration Steps

Karena data masih kosong, migration lebih sederhana:

```sql
-- Step 1: Add column branch to notification_ref
ALTER TABLE notification_ref ADD COLUMN branch TEXT NOT NULL DEFAULT '';

-- Step 2: Drop column branch from claim
ALTER TABLE claim DROP COLUMN branch;
```

**Drizzle Migration Command:**
```bash
npm run db:generate  # Generate migration file
npm run db:migrate   # Apply migration
```

---

## ⚠️ Perhatian & Limitasi

### 1. Branch untuk Claim Tanpa NotificationCode

**Masalah:**
Saat ini, implementasi mengasumsikan semua claim dibuat dengan `notificationCode`. Field `branch` diambil dari `notificationRef.branch` melalui join.

**Scenario Problematic:**
Jika claim dibuat **tanpa notificationCode** (field `notification` kosong), maka:
- `branch` akan menjadi `NULL` atau tidak tersedia
- Query join tidak akan menghasilkan branch yang benar

**Solusi Alternatif:**
1. **Opsional 1 (Recommended):** Wajib mengisi `notificationCode` saat create claim
2. **Opsional 2:** Tambahkan field `branch` di `claim` dan isi manual jika tanpa notificationCode
3. **Opsional 3:** Ambil branch dari `user.branch` (user yang membuat claim)

### 2. User-RMA Field `branch`

Field `branch` sudah ada di table `user_rma`:
```typescript
branch: text('branch').notNull()
```

Ini berarti setiap user harus punya 1 branch spesifik. Function `getCurrentUserBranch()` sudah disiapkan untuk mengambil branch dari user login.

---

## ✅ Checklist Implementasi

- [x] Update `notification-ref.ts` schema - tambah field `branch`
- [x] Update `claim.ts` schema - hapus field `branch`
- [x] Update `notification-refs` API - POST (tambah branch validation)
- [x] Update `notification-refs` API - PUT (disable branch update)
- [x] Update `notification-refs` API - GET (return branch)
- [x] Implement auth session helper `getCurrentUserBranch()`
- [x] Update `claims` API - POST (validasi branch tidak boleh di input)
- [x] Update `claims` API - GET (join notificationRef untuk branch)
- [x] Update `claims` API - GET by ID (join notificationRef untuk branch)
- [x] Run `npm run typecheck` - ✅ Passed
- [x] Run `npm run lint` - ✅ Passed (hanya warning yang sudah ada)

---

## 🧪 Testing Checklist

Setelah migration diaplikasikan, berikut checklist testing yang perlu dilakukan:

### Notification Refs API
- [ ] POST `/api/notification-refs` dengan `branch` berhasil
- [ ] POST `/api/notification-refs` tanpa `branch` gagal (validation error)
- [ ] PUT `/api/notification-refs/:id` update field lain berhasil
- [ ] PUT `/api/notification-refs/:id` coba update `branch` gagal (error: "Branch cannot be updated")
- [ ] GET `/api/notification-refs` return field `branch`
- [ ] GET `/api/notification-refs/:code` return field `branch`

### Claims API
- [ ] POST `/api/claims` dengan `notificationCode` berhasil (branch otomatis diambil)
- [ ] POST `/api/claims` dengan `branch` di body gagal (error: "Branch is auto-filled...")
- [ ] GET `/api/claims` return `branch` yang benar (dari notificationRef)
- [ ] GET `/api/claims/:id` return `branch` yang benar (dari notificationRef)
- [ ] PUT `/api/claims/:id` update field lain berhasil

### Edge Cases
- [ ] Claim tanpa notificationCode (bagaimana branch-nya?)
- [ ] Join claim dengan notification yang sudah dihapus/deleted
- [ ] Performance test untuk query dengan join notificationRef

---

## 📝 Next Steps

### Sebelum Migration
1. **Konfirmasi** solusi untuk claim tanpa notificationCode
2. **Backup** database (jika sudah ada data production)
3. **Review** migration plan dengan team DBA

### Setelah Migration
1. **Deploy** ke staging environment
2. **Run manual testing** sesuai checklist di atas
3. **Update documentation** API
4. **Deploy** ke production

---

## 📚 Referensi

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Zod Validation](https://zod.dev/)
- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Better Auth Documentation](https://www.better-auth.com/)

---

**Dokumentasi ini dibuat pada:** 2025-01-05  
**Author:** AI Assistant  
**Status:** Ready for Review
