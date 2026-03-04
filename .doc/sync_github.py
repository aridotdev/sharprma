import subprocess
import re
import os
import json

def run_command(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def get_repo_path():
    res = run_command(["gh", "repo", "view", "--json", "owner,name"])
    if res.returncode != 0:
        print("❌ Error: Pastikan kamu sudah di dalam folder git dan sudah 'gh auth login'")
        exit(1)
    data = json.loads(res.stdout)
    return f"{data['owner']['login']}/{data['name']}"

def sync_all(filename):
    repo_path = get_repo_path()
    print(f"📦 Target Repo: {repo_path}")

    if not os.path.exists(filename):
        print(f"❌ File {filename} tidak ditemukan!")
        return

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # --- LANGKAH 1: BUAT MILESTONE ---
    milestones = set(re.findall(r'\*\*Milestone\*\*: (.*)', content))
    print(f"🛠️  Sinkronisasi {len(milestones)} Milestone...")
    for m in milestones:
        m = m.strip()
        cmd = ["gh", "api", f"repos/{repo_path}/milestones", "-f", f"title={m}"]
        res = run_command(cmd)
        if res.returncode == 0:
            print(f"   ✅ Milestone Created: {m}")

    # Mencari semua label di dalam backticks, misal: `feat`, `backend`
    label_matches = re.findall(r'\*\*Labels\*\*: (.*)', content)
    all_labels = set()
    for match in label_matches:
        # Menemukan semua teks di dalam backticks pada baris Labels
        labels_in_row = re.findall(r'`([^`]+)`', match)
        for l in labels_in_row:
            all_labels.add(l.strip())

    print(f"🏷️  Sinkronisasi {len(all_labels)} Labels...")
    for label in all_labels:
        # Mencoba membuat label. Jika sudah ada, GitHub CLI akan memberi error tapi kita abaikan.
        cmd = ["gh", "label", "create", label, "--color", "ededed"]
        res = run_command(cmd)
        if res.returncode == 0:
            print(f"   ✅ Label Created: {label}")
        elif "already exists" in res.stderr.lower():
            print(f"   🟡 Label '{label}' sudah ada.")

    # --- LANGKAH 3: BUAT ISSUE ---
    issue_blocks = re.split(r'### Issue #', content)[1:]
    print(f"\n🚀 Mengirim {len(issue_blocks)} Issue ke GitHub...")

    for block in issue_blocks:
        lines = block.strip().split('\n')
        # Parsing judul: mengambil teks setelah nomor issue dan tanda pemisah
        title_line = lines[0]
        full_title = title_line.split(' — ', 1)[1].strip() if ' — ' in title_line else title_line.strip()
        
        labels_match = re.search(r'\*\*Labels\*\*: (.*)', block)
        if labels_match:
            labels_list = re.findall(r'`([^`]+)`', labels_match.group(1))
            labels = ",".join(labels_list)
        else:
            labels = ""
        
        milestone_match = re.search(r'\*\*Milestone\*\*: (.*)', block)
        milestone = milestone_match.group(1).strip() if milestone_match else ""

        body_start = block.find('## Deskripsi')
        body = block[body_start:].strip() if body_start != -1 else block

        cmd = ["gh", "issue", "create", "--title", full_title, "--body", body]
        if labels: cmd.extend(["--label", labels])
        if milestone: cmd.extend(["--milestone", milestone])

        res = run_command(cmd)
        if res.returncode == 0:
            print(f"   ✅ Done: {full_title}")
        else:
            print(f"   ❌ Fail: {full_title} -> {res.stderr.strip()}")

if __name__ == "__main__":
    sync_all("github_issues.md")