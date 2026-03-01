#!/bin/bash

# Pastikan gh CLI terinstall dan sudah login
if ! command -v gh &> /dev/null
then
    echo "❌ Error: GitHub CLI ('gh') tidak ditemukan."
    echo "Silakan install: sudo apt install gh (untuk Ubuntu/Debian)"
    exit 1
fi

# Jalankan skrip python pendukung untuk parsing yang lebih akurat
# Tapi jika Anda ingin cara manual per issue, gunakan:
# gh issue create --title "Judul" --body-file "file.md"

python3 .gemini/antigravity/brain/7b7a3c92-36ea-4e07-8935-cf55c9d281da/create_issues.py
