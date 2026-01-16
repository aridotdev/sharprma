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
