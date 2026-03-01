import subprocess
import json

def run_command(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def cleanup_closed_issues():
    print("🔍 Mendeteksi issue di repository...")

    # 1. Ambil daftar semua issue (open & closed) dalam format JSON
    # Kita ambil 1000 issue terakhir agar tidak ada yang terlewat
    cmd_list = ["gh", "issue", "list", "--state", "all", "--limit", "1000", "--json", "number,title,state"]
    res = run_command(cmd_list)

    if res.returncode != 0:
        print(f"❌ Gagal mengambil daftar issue: {res.stderr.strip()}")
        return

    issues = json.loads(res.stdout)
    
    if not issues:
        print("✅ Tidak ada issue yang ditemukan.")
        return

    print(f"📊 Ditemukan total {len(issues)} issue.")
    
    closed_issues = [i for i in issues if i['state'] == 'CLOSED']
    
    if not closed_issues:
        print("ℹ️ Tidak ada issue dengan status 'CLOSED' untuk dihapus.")
        return

    print(f"🗑️  Menghapus {len(closed_issues)} issue yang berstatus CLOSED...\n")

    for issue in closed_issues:
        num = issue['number']
        title = issue['title']
        
        # 2. Hapus issue berdasarkan nomor
        # Flag --confirm digunakan agar tidak muncul prompt Y/N di terminal
        cmd_delete = ["gh", "issue", "delete", str(num), "--confirm"]
        del_res = run_command(cmd_delete)
        
        if del_res.returncode == 0:
            print(f"   ✅ Deleted #{num}: {title}")
        else:
            print(f"   ❌ Failed to delete #{num}: {del_res.stderr.strip()}")

    print("\n✨ Proses pembersihan selesai!")

if __name__ == "__main__":
    # Pastikan user yakin karena ini tindakan destruktif
    confirm = input("Apakah kamu yakin ingin MENGHAPUS PERMANEN semua issue berstatus CLOSED? (y/n): ")
    if confirm.lower() == 'y':
        cleanup_closed_issues()
    else:
        print("❌ Operasi dibatalkan.")