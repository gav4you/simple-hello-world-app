# GitLab Setup + Day-to-Day Workflow — Breslov Academy
Prepared: January 01, 2026 (Asia/Jerusalem)

Repo:
- HTTPS: `https://gitlab.com/yeshivabachur/breslov-academy.git`
- SSH: `git@gitlab.com:yeshivabachur/breslov-academy.git`
- GitLab CLI: `gh repo clone yeshivabachur/breslov-academy`

---

## 1) Clone
### HTTPS
```bash
git clone https://gitlab.com/yeshivabachur/breslov-academy.git
cd breslov-academy
```

### SSH (recommended if you use SSH keys)
```bash
git clone git@gitlab.com:yeshivabachur/breslov-academy.git
cd breslov-academy
```

### GitLab CLI
```bash
gh repo clone yeshivabachur/breslov-academy
cd breslov-academy
```

---

## 2) Branching model (simple + safe)
- `main` = always deployable (PR-only)
- optional: `release/v9.x` = stabilization branch if you want to lock releases
- feature branches:
  - `feat/<topic>`
  - `fix/<topic>`
  - `chore/<topic>`

Rules:
- No direct commits to `main`.
- PRs must pass CI + QA gates before merge.
- For risky changes, use feature flags.

---

## 3) Commit convention (keeps changelog clean)
Examples:
- `feat(student): add portal shell + route guards`
- `fix(gating): prevent materials fetch when locked`
- `chore(ci): add lint + typecheck actions`
- `docs(spec): update roadmap and QA gates`

---

## 4) PR discipline
- Keep PRs small and scoped.
- Every PR must preserve:
  - Vault discoverability
  - tenant scoping
  - content gating (no material fetch while locked)
  - idempotent purchases
