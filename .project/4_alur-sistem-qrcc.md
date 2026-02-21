# ALUR UTAMA SISTEM (REVISED)

## 🧭 ALUR QRCC — REVIEW CLAIM RMA

🟢 **KONDISI AWAL**
- QRCC sudah login
- Role = QRCC (atau ADMIN)
- Di `/dashboard/claims` tersedia daftar klaim dengan status `SUBMITTED`

---

## 🎯 ENTRY POINT: Daftar Klaim

**QRCC Membuka Daftar Klaim SUBMITTED:**
1. QRCC buka halaman `/dashboard/claims`
2. Default filter: status = `SUBMITTED`
3. Tersedia filter tambahan: vendor, tanggal, branch
4. QRCC klik salah satu klaim

---

## 🔍 REVIEW KLAIM

### 1. Buka Halaman Detail Klaim

**Saat QRCC klik klaim:**
- Sistem redirect ke `/dashboard/claims/:id`
- **Sistem otomatis mengubah** `claimStatus → IN_REVIEW`
- Record `ClaimHistory` dibuat otomatis:
  - `action = START_REVIEW`
  - `fromStatus = SUBMITTED`
  - `toStatus = IN_REVIEW`
  - `actorRole = QRCC`

---

### 2. Layout Halaman Review

**Halaman dibagi dalam 3 tab:**

```
┌────────────────────────────────────────────────────┐
│  Header: Claim #CL-20260221-001 | Status: IN_REVIEW │
│  [Claim Info] [Photos] [History]  ← tab navigation  │
└────────────────────────────────────────────────────┘

TAB 1: Claim Info (sebagian editable)
TAB 2: Photo Review
TAB 3: Claim History (audit trail read-only)
```

---

### 3. TAB 1 — Claim Info

**Field READ-ONLY (tidak bisa diubah QRCC):**
- `notificationCode`, `notificationDate`, `modelName`, `inch`, `vendorId`, `branch`

**Field EDITABLE oleh QRCC (untuk koreksi data):**

| Field           | Tipe Input      | Keterangan              |
| --------------- | --------------- | ----------------------- |
| `panelSerialNo` | text            | Serial panel            |
| `ocSerialNo`    | text            | Serial OC               |
| `defect`        | autocomplete    | Dari DefectMaster       |
| `odfNumber`     | text (opsional) | Jika vendor membutuhkan |
| `version`       | text (opsional) | Jika vendor membutuhkan |
| `week`          | text (opsional) | Jika vendor membutuhkan |

> **Catatan:** Perubahan data oleh QRCC tidak mengubah status klaim. Status tetap `IN_REVIEW`.

---

### 4. TAB 2 — Photo Review

**QRCC mereview setiap foto satu per satu:**

```
┌────────────────────────────────────────────┐
│ 📸 CLAIM Photo                             │
│                                            │
│ [Preview full-size foto]                   │
│                                            │
│ ✅ VERIFIED   ❌ REJECT                    │
│                                            │
│ Note (wajib jika REJECT):                  │
│ [__________________________________]       │
└────────────────────────────────────────────┘
```

**Untuk setiap foto:**
- QRCC pilih **VERIFIED** atau **REJECT**
- Jika **REJECT**: wajib isi catatan/alasan
- Progress indicator: "3 dari 6 foto sudah direview"
- Tombol navigasi: "Foto Sebelumnya / Foto Berikutnya"

**Record `PhotoReview` dibuat per foto:**
- `claimPhotoId`, `reviewedBy`, `status`, `note`, `reviewedAt`

---

### 5. Submit Review

**Tombol "Selesai Review" aktif saat semua foto sudah direview.**

**Saat QRCC klik "Selesai Review", sistem kalkulasi otomatis:**

```
Jika ada foto dengan status REJECTED:
  → claimStatus = NEED_REVISION
  → Update ClaimPhoto.status = REJECTED (yang ditolak)
  → Update ClaimPhoto.reviewNote = catatan QRCC
  → ClaimHistory: action = REJECT, toStatus = NEED_REVISION
  → ⚠️ NOTIFIKASI dikirim ke CS pemilik klaim:
      - Badge/alert muncul di halaman /cs (index CS)
      - Alert hanya tampil untuk akun CS pemilik klaim tersebut
      - Pesan: "Klaim [#CL-xxx] memerlukan revisi"

Jika semua foto VERIFIED:
  → claimStatus = APPROVED
  → Update ClaimPhoto.status = VERIFIED (semua)
  → ClaimHistory: action = APPROVE, toStatus = APPROVED
  → CS hanya perlu melihat perubahan status (tidak ada notifikasi khusus)
```

---

### 6. Setelah Review Selesai

- QRCC kembali ke `/dashboard/claims`
- Klaim APPROVED siap diproses ke Vendor Claim

---

## 📦 ALUR VENDOR CLAIM

### 1. Generate Vendor Claim (Wizard 3 Step)

**Entry point:** QRCC buka `/dashboard/vendor-claims/create`

---

#### STEP 1 — Pilih Vendor & Filter Klaim

**QRCC memilih:**
- **Vendor** (dropdown): MOKA / MTC / SDP
- **Filter periode** (opsional): tanggal klaim dari–sampai

**Sistem menampilkan:**
- Daftar klaim `APPROVED` yang **belum masuk Vendor Claim manapun**, filtered by vendor
- Kolom: Claim #, Model, Panel SN, Defect, Tanggal Submit, Branch

---

#### STEP 2 — Checklist Klaim

**QRCC:**
- Centang klaim yang akan dimasukkan ke batch
- Tersedia "Select All" untuk pilih semua sekaligus
- Counter: "X klaim dipilih"

**Validasi:** Minimal 1 klaim harus dipilih untuk lanjut ke Step 3

---

#### STEP 3 — Preview & Generate

**Sistem menampilkan summary:**
```
Vendor       : MOKA
Total Klaim  : 12
Periode      : 01 Feb – 21 Feb 2026

[tabel: No | Claim # | Model | Panel SN | Defect | Branch]
```

**Saat QRCC klik "Generate Vendor Claim":**
1. Sistem buat record `VendorClaim`:
   - `vendorClaimNo` = `VC-{YYYYMMDD}-{Sequence}`
   - `status = CREATED`
   - `reportSnapshot` = JSON snapshot data klaim
2. Sistem buat record `VendorClaimItem` per klaim:
   - `vendorDecision = PENDING`
3. **File Excel auto-generate & download** (data klaim + link foto per klaim)
4. Redirect ke `/dashboard/vendor-claims/:id`
5. Success toast: "Vendor Claim [#VC-xxx] berhasil dibuat"

> **Catatan:** Pengiriman file Excel ke vendor dilakukan **manual di luar sistem** (email, WA, dll).

---

### 2. Input Keputusan Vendor (Per Item)

**Halaman `/dashboard/vendor-claims/:id` menampilkan:**

| Claim #   | Model | Panel SN | Defect | Keputusan Vendor | Kompensasi | Alasan Reject |
| --------- | ----- | -------- | ------ | ---------------- | ---------- | ------------- |
| CL-xxx-01 | ...   | ...      | ...    | `PENDING`        | -          | -             |
| CL-xxx-02 | ...   | ...      | ...    | `ACCEPTED`       | Rp 500.000 | -             |
| CL-xxx-03 | ...   | ...      | ...    | `REJECTED`       | -          | "Unit rusak"  |

**QRCC klik edit per item → modal:**
```
┌──────────────────────────────────────┐
│ Input Keputusan Vendor               │
│ Claim: #CL-20260221-001              │
│                                      │
│ Keputusan: ( ) ACCEPTED  ( ) REJECTED│
│                                      │
│ Kompensasi (jika ACCEPTED):          │
│ Rp [___________]                     │
│                                      │
│ Alasan Reject (jika REJECTED):       │
│ [___________________________________]│
│                                      │
│ [Batal]              [Simpan]        │
└──────────────────────────────────────┘
```

**Field:**
- `vendorDecision`: ACCEPTED / REJECTED
- `compensation`: nominal integer (opsional, hanya jika ACCEPTED)
- `rejectReason`: text (wajib jika REJECTED)
- `vendorDecisionAt`: timestamp otomatis saat simpan
- `vendorDecisionBy`: user QRCC yang input

**Auto-kalkulasi status VendorClaim:**
```
Masih ada item PENDING  → status = PROCESSING
Semua item terisi       → status = COMPLETED
```

---

## 🗄️ MASTER DATA MANAGEMENT

**QRCC memiliki akses CRUD untuk semua data master:**

| Master Data        | URL                                    | Fitur Khusus                        |
| ------------------ | -------------------------------------- | ----------------------------------- |
| Vendor             | `/dashboard/master/vendor`             | Toggle active/inactive              |
| Product Model      | `/dashboard/master/product-model`      | Filter by vendor                    |
| Notification       | `/dashboard/master/notification`       | Input manual + **Import Excel**     |
| Defect Master      | `/dashboard/master/defect`             | Toggle active/inactive              |
| Vendor Photo Rules | `/dashboard/master/vendor-photo-rules` | Setup per vendor, toggle isRequired |
| Vendor Field Rules | `/dashboard/master/vendor-field-rules` | Setup per vendor, toggle isRequired |

### Import NotificationMaster (Excel)

**Flow import:**
1. QRCC klik "Import Excel" di halaman Notification Master
2. Upload file Excel (template tersedia untuk di-download)
3. Sistem preview data: tabel hasil parsing + highlight baris error
4. QRCC konfirmasi → Sistem insert/update ke database
5. Summary: "X berhasil diimport, Y gagal (alasan)"

**Kolom template Excel:**
`notificationCode` | `notificationDate` | `modelName` | `branch` | `vendorId`

---

## 📊 STATUS RANGKUMAN

**Aksi QRCC berdasarkan Status Klaim:**

| Status Klaim  | Aksi QRCC                                  |
| ------------- | ------------------------------------------ |
| SUBMITTED     | Buka detail → auto IN_REVIEW               |
| IN_REVIEW     | Edit field tertentu, review foto, submit   |
| NEED_REVISION | Read-only, tunggu revisi CS                |
| APPROVED      | Read-only, bisa dimasukkan ke Vendor Claim |
| ARCHIVED      | Read-only                                  |

**Status VendorClaim:**

| Status     | Kondisi                                        |
| ---------- | ---------------------------------------------- |
| CREATED    | Baru di-generate, belum ada keputusan vendor   |
| PROCESSING | Ada sebagian keputusan vendor yang sudah diisi |
| COMPLETED  | Semua item sudah ada keputusan vendor          |

---

📌 **Peran QRCC SELESAI di sini** — klaim yang APPROVED & keputusan vendor sudah diinput masuk ke proses Reporting & Analytics
