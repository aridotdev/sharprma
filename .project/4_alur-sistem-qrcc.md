# ALUR UTAMA SISTEM

## 🧭 ALUR QRCC (QC)

### 1. QRCC Review Claim

   1. QRCC membuka daftar klaim `SUBMITTED`
   2. QRCC mulai review → `claimStatus` = `IN_REVIEW`
   3. QRCC review foto satu per satu: `VERIFIED` / `REJECT` + note
   4. QRCC bisa mengedit data yang ada di claim (kecuali foto)
   5. System re-calc status:
      - Ada `REJECT` → `NEED_REVISION`
      - Semua `VERIFIED` → `APPROVED`
   6. System mencatat ClaimHistory otomatis
-------------------------------------------------------------------------

### 2. Alur Vendor Claim

1.  QRCC filter claim `APPROVED` & belum diklaim & per vendor.
2.  Checklist claim yang akan digenerate.
3.  Generate `VendorClaim` (batch) (export ke format excel)
    - `status` = `CREATED`
4.  Kirim laporan generated ke vendor (via email, manual diluar sistem)
5.  QRCC update `status` = `CREATED` jika sudah lapor ke vendor
6.  Vendor memberi keputusan per claim
7.  QRCC input `ACCEPTED` / `REJECTED` + kompensasi per claim item

**🔒 RANGKUMAN STATUS CLAIM VENDOR**
| **Status Klaim** | **Aksi QRCC**                        |
| ---------------- | ------------------------------------ |
| DRAFT            | baru dibuat oleh qrcc                |
| CREATED          | baru digenerate oleh qrcc            |
| PROCESSING       | sedang diclaim ke vendor oleh qrcc   |
| COMPLETED        | semua vendor sudah memberi keputusan |

-------------------------------------------------------------------------

### 3. Alur Mengisi Data Master
QRCC memiliki hak akses untuk CRUD data master:
1. vendor
2. Product Model
3. Notification Master
4. Vendor Photo Rule
5. Vendor Field Rule
6. Defect Master
