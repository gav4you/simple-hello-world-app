# PR Checklist (Must Pass) — v9+
Prepared: January 01, 2026 (Asia/Jerusalem)

- [ ] No features removed; legacy routes still work via aliases.
- [ ] Vault + Feature Registry lists everything accessible.
- [ ] Tenant scoping everywhere (`activeSchoolId` portals; slug→school_id storefront).
- [ ] RBAC enforced server/app-side; wrong portal blocked.
- [ ] LOCKED/DRIP_LOCKED never fetch/render/mount materials.
- [ ] Download URLs revealed only after entitlement verification + logged.
- [ ] Search is metadata-only for unauthorized.
- [ ] Checkout idempotent (no duplicate entitlements/commissions/payouts).
- [ ] QA checklist updated for impacted flows.
- [ ] CHANGELOG/RECOVERY updated if behavior changed.
