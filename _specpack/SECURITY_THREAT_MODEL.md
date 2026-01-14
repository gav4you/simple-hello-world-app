# Security Threat Model (Practical) — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

This is a pragmatic checklist for the app-layer security model.

---

## 1) Primary threats
- Unauthorized lesson material viewing
- Download URL leakage
- Cross-tenant data leakage
- Privilege escalation (role spoofing)
- Replay/duplication in checkout flows
- Invite token reuse
- Bot abuse (signup/login/checkout)

---

## 2) Controls
### 2.1 Tenant scoping
- Every query includes `school_id` filter.
- Storefront resolves slug -> school_id at root and reuses it.

### 2.2 RBAC
- Route guards + data guards.
- Superadmin tools are locked down and audited.

### 2.3 Content gating
- LOCKED/DRIP_LOCKED never fetch materials.
- Preview rendering uses separate “safe preview” payload.

### 2.4 Download reveal
- A “reveal” action fetches URL only after entitlement verification.
- Log reveal event.
- Prefer ephemeral URLs if supported; otherwise best-effort patterns.

### 2.5 Idempotency
- Payment intent id unique
- Entitlement grants dedupe
- Commission + payout dedupe

### 2.6 Abuse protections
- Rate limit login/signup/reveal/download/checkout calls.
- Basic bot mitigation on public forms (where feasible).

---

## 3) Security regression tests
- Manually test locked/drip locked states
- Verify search never shows full content
- Try cross-tenant switching and ensure no data bleed
