# Ops Hardening + Integrity + QA (v9.0)
Prepared: January 01, 2026 (Asia/Jerusalem)

---

## 1) Ops hardening goals
- No white screens; degrade gracefully with actionable errors.
- No data leaks; tenant scoping must be consistent.
- Idempotent money flows.
- Auditability: admin actions are traceable.

---

## 2) Integrity page contract
Admin-only, vaultOnly.
Must include:
- Registry checks:
  - feature count
  - route existence best-effort
- Security/leakage heuristics:
  - “materials fetched while locked” detection (best-effort)
  - downloads url exposure checks
  - search metadata-only checks
- Tenancy heuristics:
  - scan queries for missing `school_id` filters (best-effort patterns)
- RBAC checks:
  - Network admin requires global role
  - Staff/invites/tools require admin

Export:
- JSON report with timestamp, school_id, checks, warnings, environment metadata.

---

## 3) Regression net (smoke tests)
Manual smoke checklist (must pass before release):
- Guest:
  - browse `/s/:slug` catalog and sales pages
  - confirm no full lesson materials visible
- Student locked:
  - open lesson viewer -> AccessGate only
  - confirm no materials fetch calls
- Student drip locked:
  - countdown visible; no materials fetch
- Student unlocked:
  - lesson renders; watermark/policy applied
- Downloads:
  - unauthorized -> no URL; license CTA
  - authorized -> click “Get download”; url revealed; event logged
- Staff:
  - invite staff; accept token; cannot reuse token; audit logs present
  - revoke staff; access removed
- Money:
  - approve same transaction twice -> no duplicates
  - create payout batch twice -> no duplicates

---

## 4) Performance budgets
- list queries: limit + stable sort
- cache keys include activeSchoolId
- heavy tables become cards on mobile
