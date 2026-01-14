# QA & Release Checklists — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

Use this as the “ship gate.” If any check fails, v9.0 is not stable.

---

## 1) Pre-flight
- Clean install works (`node_modules` removed -> reinstall).
- Build succeeds in production mode.
- No console errors on initial load.

---

## 2) Public Marketing
- `/` loads quickly and renders hero + CTA
- All marketing pages render on mobile
- Links to login + signup are correct

---

## 3) Auth + Portal Routing
- Student login -> student portal
- Teacher login -> teacher portal
- Admin login (if exists) -> admin portal
- Wrong portal role -> friendly “switch portal” UI

---

## 4) Tenant isolation
- Switching active school changes all scoped pages
- No data from another tenant appears in lists
- Storefront slug resolves to correct school

---

## 5) Content protection (most important)
- Guest: no full materials visible anywhere
- LOCKED: lesson viewer shows AccessGate only; no materials fetched
- DRIP_LOCKED: countdown only; no materials fetched
- UNLOCKED: materials render; watermark/policy applied

---

## 6) Downloads
- Unauthorized: no URL shown
- Authorized: “Get download” reveals URL and logs audit event
- Attempt to brute-force a file id is blocked or yields no URL

---

## 7) Storefront + Checkout
- Coupon works and is tracked
- Purchase grants entitlements (idempotent)
- Thank-you page shows purchase summary
- Affiliate referral attribution works (if enabled)

---

## 8) Ops/Admin tools
- Invites: create -> accept -> cannot reuse -> revoke
- Audit logs: events recorded for admin actions
- Integrity page: report export works

---

## 9) Performance + UX
- Tables collapse to cards on mobile
- Skeleton loaders used for slow lists
- Reduced motion respected

---

## 10) Release outputs
- CHANGELOG updated with v9.0 entry
- RECOVERY updated with:
  - where registry lives
  - how to confirm all features are present
  - how to run integrity report
- A sample exported integrity report stored in repo (if allowed)
