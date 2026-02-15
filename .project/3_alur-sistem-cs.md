# ALUR UTAMA SISTEM

## 🧭 ALUR CS — FORM CLAIM RMA (Claim Internal) 

🟢 **KONDISI AWAL**
- CS sudah login
- Role = CS
- Di halaman index CS di hero section sudah ada input field untuk memasukan notification code untuk memulai proses klaim RMA.

### 1. CS Mengisi informasi awal
  **A. Mengisi Notification Code**
  - CS mengisi field notification
  - CS klik enter untuk Cari / Validasi
  - akan masuk ke halaman input data.
  - Sistem melakukan :
    - Lookup ke tabel `notification` berdasarkan `code` yang diinput CS
  - Hasil Lookup Notification
    - Jika Notification DITEMUKAN ✅, data akan terisi otomatis untuk field:
        - `notificationCode` → dari input CS
        - `productModelId` → dari tabel notifikasi        
        - `inch` → dari tabel productModel (inch)
        - `vendorId` -> dari tabel productModel (vendor id)
        - `branch` → dari tabel notification (branch)

      - akan menampilkan toast notifikasi berhasil ditemukan
    📌 Field berikut menjadi read-only: `notificationCode`, `productModelId`, `inch`, `vendorId`, `branch`
    
    - Jika Notification TIDAK DITEMUKAN ❌
      - Sistem Menampilkan toast: **“Notification tidak ditemukan”**
      - menampilkan section Mengisi nama model (poin B)

  **B. Mengisi nama model**
  - CS mengisi field nama model (auto complete diambil dari tabel `ProductModel`)
  - CS klik enter untuk cari / validasi
  - Sistem melakukan :
    - Lookup ke tabel `ProductModel`
  - Hasil lookup nama model
    - Jika nama model DITEMUKAN ✅, Masuk ke halaman input data step 1. sistem akan:
      - Mengisi otomatis:
        - `modelName` → dari input CS
        - `vendorId` → dari `ProductModel`
        - `inch` → dari `ProductModel`
        - `branch` → dari `user-rma` (ambil dari session)
        - `notificationCode` → input manual oleh CS
    📌 Field berikut menjadi read-only: `modelName`, `vendorId`, `inch`, `branch`
---------------------------------------------------------------------------------------------------------

### 2. CS Mengisi data klaim

  - Status awal klaim = `DRAFT`, belum ada data yang disimpan permanen.
  - CS bisa menyimpan data kapan saja dengan klik tombol "Save Draft"
  

  **A. Step-1 (Notifikasi)**

  CS  melihat data yang sudah terisi dari poin 1

      - `notificationCode`
      - `modelName`
      - `inch`
      - `branch`
      - `vendorId`
  
  **B. Step-2 (Unit Detail)**
  
  CS mengisi field berikut:
  
    - `panelSerialNo`
    - `OcSerialNo`
    - `defect`
    - `OdfNumber` → Field kondisional (berdasarkan `VendorFieldRule`)
    - `version` → Field kondisional (berdasarkan `VendorFieldRule`)
    - `week` → Field kondisional (berdasarkan `VendorFieldRule`)

  📌 Validasi berdasarkan VendorFieldRule

  **C. Step-3 (Photo Evidence)**

  - CS Upload Foto-foto bukti.
  - Jenis Foto (ClaimPhoto.photoType).
  - Sistem menentukan foto wajib berdasarkan `VendorPhotoRule`:

  | STEP   | Photo Type  | MOKA     |  MTC        |  SDP       |
  | ------ | ----------  | -------- |  --------   |  --------  |
  | 1      | Claim       | ✅       |  ✅         |  ✅        |
  | 2      | CLAIM_ZOOM  | ✅       |  ✅         |  ✅        |
  | 3      | ODF         | ✅       |  ✅         |  ✅        |
  | 4      | PANEL_SN    | ✅       |  ✅         |  ✅        |
  | 5      | WO_PANEL    | ✅       |  ❌         |  ❌        |
  | 6      | WO_PANEL_SN | ✅       |  ❌         |  ❌        |

📌 Semua foto:
  - Status awal = `PENDING`
  - Bisa di-upload ulang selama belum `APPROVED`
--------------------------------------------------------------------------

### 3. CS Submit Klaim
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
--------------------------------------------------------------------------

### 4. CS Menunggu Review QRCC

**Setelah submit:**
1. CS tidak bisa edit data
2. CS hanya bisa:
     - Melihat status klaim
     - Melihat status foto
--------------------------------------------------------------------------

### 5. Jika Klaim NEED_REVISION

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
--------------------------------------------------------------------------

#### 7. Jika Klaim APPROVED
- Semua foto `VERIFIED`
- Klaim tidak bisa diubah lagi oleh CS
- Klaim siap diproses ke vendor (alur QRCC)

--------------------------------------------------------------------------

**🔒 RANGKUMAN STATUS CS**
| **Status Klaim**  | **Aksi CS**     |
| ------------      | -----------     |
| DRAFT       	    | Edit bebas      |
| SUBMITTED	        | Read-only       |
| NEED_REVISION	    | Edit terbatas   |
| APPROVED	        | Read-only       |
| CANCELLED	        | Tidak bisa edit |


📌 Peran CS SELESAI di sini