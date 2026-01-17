# HISTORY PROJECT (CATAT SETIAP ADA PERUBAHAN)
SOP Workflow: prompt ai -> update history -> update code -> update file di project claude.ai - review code -> test code -> update history.

16/01/2026
- re-start project
- create .project folder
- create .doc folder
- create .agent.md
- initial prompt dengan claude dan dapat rekomendasi perbaikan:

1. Tipe Data createdAt/updatedAt menggunakan Text.✅

    --> SQLite best practice: Gunakan integer untuk menyimpan Unix timestamp (epoch time).
    
    [x] Ubah tipe data createdAt/updatedAt menjadi integer✅
    
2. Tambah keterangan Boolean pada field isRequired, isActive, dll. ✅


17/01/2026
1. Tambahkan informasi `onDelete` RESTRICT strategy di Drizzle di semua dokumen database ✅
2. Tambahkan informasi terkait Photo Upload :
    - Validasi File
    - Security
    - Thumbnail generation (library sharp node.js)
3. FINALIZED AUTH FLOW DECISIONS (10.alur-auth.md) ✅
4. Tambahkan branch di user_rma ✅
5. Buat server/utils/loginAttempts.ts✅