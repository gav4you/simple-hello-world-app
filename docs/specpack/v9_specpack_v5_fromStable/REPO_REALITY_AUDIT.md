# Repo Reality Audit (Run Locally) — Breslov Academy
Prepared: January 01, 2026 (Asia/Jerusalem)

You asked me to “read the GitLab repo and integrate details.”
Important limitation: I can’t reliably fetch private GitLab repo contents from here.
So this file defines a **zero-guess** protocol to extract the repo “truth” from your machine,
then we incorporate it into the roadmap before writing pages of code.

Repo:
- HTTPS: `https://gitlab.com/yeshivabachur/breslov-academy.git`
- SSH: `git@gitlab.com:yeshivabachur/breslov-academy.git`
- GH CLI: `gh repo clone yeshivabachur/breslov-academy`

---

## 0) One-time: clone + open
```bash
gh repo clone yeshivabachur/breslov-academy
cd breslov-academy
```

---

## 1) Generate a “Repo Snapshot” text file
Run this and paste the output into chat (or commit it under `docs/repo-snapshot.md`).

### 1.1 Identity
```bash
echo "## REPO ID"
git remote -v
git rev-parse HEAD
git status -sb
git log -1 --oneline
```

### 1.2 Tech stack + scripts
```bash
echo "## PACKAGE.JSON"
cat package.json
```

### 1.3 High-level tree (first 6 levels)
Mac/Linux:
```bash
echo "## TREE"
find . -maxdepth 6 -type d \( -name node_modules -o -name .git -o -name dist -o -name build \) -prune -false -o -type f -print | sed -n '1,300p'
```

Windows PowerShell:
```powershell
"## TREE"
Get-ChildItem -Recurse -Depth 6 -File | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\.git\\|\\dist\\|\\build\\' } | Select-Object -First 300 FullName
```

### 1.4 Router + pages discovery (search terms)
Mac/Linux (recommended: ripgrep `rg`):
```bash
echo "## ROUTER HITS"
rg -n "react-router|createBrowserRouter|Routes\b|Route\b|next/router|app\/" -S . | sed -n '1,200p'
echo "## VAULT/REGISTRY HITS"
rg -n "Vault|featureRegistry|registry|Command.*Palette" -S . | sed -n '1,200p'
echo "## TENANT HITS"
rg -n "tenant|schoolSlug|school_id|activeSchool" -S . | sed -n '1,200p'
echo "## GATING HITS"
rg -n "LOCKED|DRIP_LOCKED|UNLOCKED|materials|downloadUrl" -S . | sed -n '1,200p'
```

---

## 2) Integrating the snapshot into this Spec Pack
Once you paste the snapshot:
- We will **replace “assumptions”** in `ROADMAP_V9_DETAILED.md` with exact file paths.
- We will create a “Legacy Route Map” from the real router list.
- We will adjust the plan to your actual stack (Vite vs Next, Base44 entities, etc.).
