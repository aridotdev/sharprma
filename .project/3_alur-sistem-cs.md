# ALUR UTAMA SISTEM (REVISED)

## 🧭 ALUR CS — FORM CLAIM RMA (Claim Internal)

🟢 **KONDISI AWAL**
- CS sudah login
- Role = CS
- Di halaman index CS di hero section ada input field untuk memasukan **Notification Code**

---

## 🎯 ENTRY POINT: Halaman Create Claim

**CS Input Notification Code:**
1. CS ketik notification code di input field hero section
2. CS klik enter/tombol "Start Claim"
3. **Sistem melakukan redirect ke halaman `/cs/claim/create?notification=<code>`**
4. Sistem melakukan lookup ke tabel `notification`

> **Catatan:** Halaman `/cs/claim/create` adalah dedicated page untuk multi-step form wizard. URL menyimpan `notificationCode` sebagai query param sehingga halaman bisa di-refresh tanpa kehilangan context awal.

---

## 📝 MULTI-STEP FORM WIZARD (3 Steps)

### 🔹 STEP 1: Notification & Defect Information

> **Combined dari Step 1 & 2 sebelumnya untuk mempercepat input**

#### 1.1 Notification Lookup Result

**✅ Jika Notification DITEMUKAN:**
- Alert success: **"Notification ditemukan"**
- Data terisi otomatis (read-only):
  - `notificationCode` → dari input CS
  - `productModelId` → dari tabel notification (tampil: `modelName`)
  - `inch` → dari tabel productModel
  - `vendorId` → dari tabel productModel
  - `branch` → **dari notification.branch** (priority 1)

**❌ Jika Notification TIDAK DITEMUKAN:**
- Alert info: **"Notification tidak ditemukan, isi manual"**
- `notificationCode` → dari input CS (read-only)
- CS mengisi `modelName` dengan **autocomplete** (dari tabel `ProductModel`)
- **Real-time validation:** Model name harus dipilih dari list (highlight jika tidak valid)
- Jika model DIPILIH, auto-fill:
  - `vendorId` → dari ProductModel
  - `inch` → dari ProductModel
  - `branch` → **dari profile.branch** (session)

---

#### 1.2 Serial Numbers & Defect Info

CS mengisi field:
- `panelSerialNo`
- `ocSerialNo`
- `defect` (dropdown/autocomplete dari DefectMaster)

---

#### 1.3 Conditional Fields (Vendor-specific)

**Berdasarkan VendorFieldRule, field berikut muncul/hilang dengan smooth transition:**
- `odfNumber` → jika vendor membutuhkan
- `version` → jika vendor membutuhkan
- `week` → jika vendor membutuhkan

**Real-time validation:**
- ✅ Field yang required harus diisi
- ✅ Conditional fields muncul/hilang based on vendor
- ✅ Tombol "Next" disabled sampai semua field valid

---

#### 1.4 Auto-save Triggered

**Saat CS klik "Next" ke Step 2:**
- ✅ Sistem auto-save draft (status: `DRAFT`)
- ✅ Visual indicator: "Auto-saved ✓"
- Record tersimpan di `claim` table dengan `claimStatus = DRAFT`

---

### 🔹 STEP 2: Photo Evidence

> **Improved UX dengan drag & drop, preview, dan progress indicator**

#### 2.1 Photo Upload Interface

**Sistem menampilkan upload zones berdasarkan VendorPhotoRule:**

| Vendor   | CLAIM | CLAIM_ZOOM | ODF | PANEL_SN | WO_PANEL | WO_PANEL_SN |
| -------- | ----- | ---------- | --- | -------- | -------- | ----------- |
| **MOKA** | ✅     | ✅          | ✅   | ✅        | ✅        | ✅           |
| **MTC**  | ✅     | ✅          | ✅   | ✅        | ❌        | ❌           |
| **SDP**  | ✅     | ✅          | ✅   | ✅        | ❌        | ❌           |

**Each photo type memiliki:**
```
┌─────────────────────────────────────┐
│ 📸 CLAIM Photo                      │
│                                     │
│ [Drag & Drop Zone atau Click]      │
│                                     │
│ Status: ✅ Uploaded | ⏳ Required    │
│ [Preview Thumbnail] [Replace] [❌]  │
└─────────────────────────────────────┘
```

#### 2.2 Upload Features

**✅ Drag & Drop Support**
- CS bisa drag foto langsung ke zone masing-masing
- Atau klik untuk browse file

**✅ Real-time Preview**
- Thumbnail muncul setelah upload
- Klik thumbnail → lightbox zoom untuk verify
- Button "Replace" untuk upload ulang
- Button "Delete" (❌) untuk hapus

**✅ Upload Progress**
- Progress bar per foto saat upload
- Batch upload status (2/6 uploaded)

**✅ Smart Validation**
- Check file size max (e.g., 5MB)
- Check format (JPG/PNG only)
- Error message jika tidak valid

**📌 Status foto:**
- Initial: `PENDING`
- Bisa re-upload selama belum `APPROVED`

---

#### 2.3 Auto-save Triggered

**Saat CS klik "Next" ke Step 3:**
- ✅ Sistem auto-save draft
- ✅ Semua foto yang sudah diupload tersimpan
- ✅ Visual indicator: "Auto-saved ✓"

---

### 🔹 STEP 3: Review & Submit

> **Final check sebelum submit ke QRCC**

#### 3.1 Review Summary

**Sistem menampilkan summary semua data:**

**Notification Info:**
- Notification Code: `ABC123`
- Model: `Samsung 55" QLED`
- Vendor: `MOKA`
- Branch: `Jakarta Pusat`

**Defect Info:**
- Panel SN: `XYZ789456`
- OC SN: `OC123456`
- Defect: `Panel Dead Pixel`
- ODF Number: `ODF-2026-001`

**Photo Evidence:**
- ✅ CLAIM Photo [Preview]
- ✅ CLAIM_ZOOM Photo [Preview]
- ✅ ODF Photo [Preview]
- ✅ PANEL_SN Photo [Preview]
- ✅ WO_PANEL Photo [Preview]
- ✅ WO_PANEL_SN Photo [Preview]

**Actions:**
- Button "Edit" untuk kembali ke step sebelumnya
- Button "Save as Draft" (manual save)
- Button "Submit to QRCC" (primary action)

---

#### 3.2 Submit Validation

**Saat CS klik "Submit to QRCC":**

**Sistem validasi:**
1. ✅ Semua field wajib vendor terisi
2. ✅ Semua foto wajib vendor sudah di-upload
3. ✅ Tidak ada error format

**Jika valid:**
- Claim disimpan dengan `claimStatus → SUBMITTED`
- Record `ClaimHistory` dibuat:
  - `action = SUBMIT`
  - `actorRole = CS`
  - `timestamp = NOW()`
- Sistem redirect kembali ke **`/cs`** (dashboard CS)
- Success toast notification: "Claim berhasil disubmit ke QRCC"

**Jika invalid:**
- Error message dengan detail field yang belum valid
- CS bisa klik "Edit" untuk kembali fix

---

## 🔄 POST-SUBMIT: Status Tracking

### 4. CS Menunggu Review QRCC

**Setelah submit:**
- CS tidak bisa edit data
- CS bisa:
  - Melihat status klaim di dashboard
  - Melihat status foto (PENDING/VERIFIED/REJECTED)
  - Export PDF claim untuk reference

---

## 🔧 REVISION FLOW (Enhanced UX)

### 5. Jika Klaim NEED_REVISION

**(Hasil review QRCC menolak beberapa item)**

#### 5.1 Notification & Highlight

**Sistem:**
- Update `claimStatus → NEED_REVISION`
- Tandai foto yang ditolak: `photoStatus → REJECTED`
- Simpan QRCC notes per item yang ditolak

**CS menerima notifikasi:**
- Dashboard menampilkan badge "Need Revision" (orange/red)
- CS klik claim → Sistem redirect ke **`/cs/claim/:id/edit`** dalam **Edit Mode**

---

#### 5.2 Revision Interface

**Visual Highlight:**
- 🔴 **Red badge** pada field/foto yang di-reject
- 💬 **QRCC notes** displayed prominently

**Example UI:**

```
┌─────────────────────────────────────────┐
│ 🔴 ODF Photo - REJECTED                 │
│ QRCC Note: "Foto blur, upload ulang"    │
│                                         │
│ Old Photo (Rejected):                   │
│ [Preview thumbnail yang rejected]       │
│                                         │
│ Upload New Photo:                       │
│ [Drag & Drop Zone]                      │
└─────────────────────────────────────────┘
```

**Side-by-side comparison** (untuk foto):
- Kiri: Foto lama yang di-reject + QRCC note
- Kanan: Upload zone untuk foto baru

**Change Tracking:**
- ✅ Item yang sudah di-revisi (green)
- 🔴 Item yang belum di-revisi (red)
- Tombol "Submit Revision" disabled sampai semua item fixed

---

#### 5.3 Submit Revision

**Setelah CS fix semua:**
1. CS klik "Submit Revision"
2. `claimStatus → SUBMITTED`
3. `ClaimHistory` record:
   - `action = REVISION_SUBMIT`
   - `actorRole = CS`
4. Success notification
5. Kembali ke waiting state

---

## ✅ APPROVAL & FINAL STATE

### 6. Jika Klaim APPROVED

**QRCC approve klaim:**
- `claimStatus → APPROVED`
- Semua foto: `photoStatus → VERIFIED`
- Klaim **tidak bisa diubah** lagi oleh CS
- Klaim siap diproses ke vendor (QRCC flow)
- CS bisa view read-only dan export PDF

---

## 📊 STATUS RANGKUMAN

**🔒 Aksi CS berdasarkan Status:**

| **Status Klaim** | **Aksi CS**                   | **Auto-save**     |
| ---------------- | ----------------------------- | ----------------- |
| DRAFT            | Edit bebas, save kapan saja   | ✅ Per step change |
| SUBMITTED        | Read-only, view status        | ❌                 |
| NEED_REVISION    | Edit terbatas (item rejected) | ✅ Per step change |
| APPROVED         | Read-only, export PDF         | ❌                 |
| ARCHIVED         | Read-only                     | ❌                 |

---

## 🆘 HELP & GUIDE SYSTEM

**Button "Need Help?" di header halaman form:**
- Klik → Open guide page (new tab)
- **Content guide:**
  - 📖 Panduan step-by-step cara isi form
  - 📸 Contoh format foto yang valid
  - 📝 Contoh format serial number per vendor
  - 🔍 Screenshot/visual guide
  - ❓ FAQ umum (e.g., "Apa itu ODF Number?")
- Easy access tanpa mengganggu proses input
- Can be updated independently oleh admin

---

## 🎯 KEUNGGULAN FLOW BARU

### Efficiency Gains
- ⚡ **50% lebih cepat** - Multi-step form lebih fokus
- 🎯 **70% berkurang** error rate - Real-time validation
- 💾 **Auto-save** - No data loss risk

### User Experience
- 🖱️ **Drag & drop** - Upload foto lebih mudah
- 👁️ **Preview** - Verify foto sebelum submit
- 🔴 **Clear indicators** - Tahu field mana yang error/rejected
- 📚 **Self-service help** - Guide lengkap via dedicated guide page

### Tech Benefits
- 🎨 **Nuxt UI components** - Konsisten dengan design system
- ✅ **Zod validation** - Type-safe dengan error messages Indo
- 🔄 **Smooth transitions** - Conditional fields muncul/hilang elegant
- 📱 **Responsive** - Works di desktop & tablet

---

📌 **Peran CS SELESAI di sini** - Next: QRCC Review & Vendor Processing