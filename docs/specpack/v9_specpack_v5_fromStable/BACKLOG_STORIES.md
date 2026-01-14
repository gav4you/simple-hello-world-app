# Backlog (Stories + Acceptance Criteria) — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

This backlog is intentionally verbose so the next coding chat can execute it like a checklist.
As soon as the v9.0 zip is uploaded, **Phase 0 Audit** must replace any “TBD” placeholders with real file paths/routes/entities.

---

## Epic A — Surface Split (Public + Student + Teacher + Admin)
### A1 — Public Marketing Shell
**Story:** As a guest, I can browse a premium marketing site and reach the correct login/signup.
- Tasks:
  - Implement marketing layout shell (header/footer, responsive).
  - Add routes: `/`, `/about`, `/how-it-works`, `/faq`, `/contact`, `/privacy`, `/terms`.
  - Ensure nav CTAs exist and are correct.
- Acceptance:
  - All pages render unauthenticated.
  - Lighthouse basics: no blocking errors; text readable on mobile.

### A2 — Separate Login Entry Points
**Story:** As a user, I can choose Student vs Teacher login and land in the right portal.
- Tasks:
  - Implement `/login/student`, `/login/teacher` (+ optional `/login/admin`).
  - Preserve legacy `/login` by redirecting to a chooser.
  - Persist chosen audience during auth redirect/callback.
- Acceptance:
  - Student login routes to `/student/dashboard`.
  - Teacher login routes to `/teacher/dashboard` (or closest existing page).
  - If user lacks the chosen role, show a helpful “wrong portal” screen with a switch button.

### A3 — Portal Layout Shells + Guards
**Story:** As a logged-in user, I see the correct portal navigation and cannot access other portals.
- Tasks:
  - Create layouts: StudentShell, TeacherShell, AdminShell, SuperAdminShell.
  - Add guard wrappers:
    - Auth required
    - Role required
    - Active tenant required
  - Add “Choose school” modal for multi-tenant users.
- Acceptance:
  - Unauthorized portal routes redirect to appropriate login.
  - Cross-tenant access is blocked.
  - Active school selector persists safely.

---

## Epic B — Registry + Vault + Integrity
### B1 — Central Feature Registry (single source of truth)
**Story:** As a developer/admin, all features are registered and discoverable.
- Tasks:
  - Create/restore registry module.
  - Populate from router map (do not guess).
  - Add legacy aliases for deep links.
- Acceptance:
  - Registry lists every page/route.
  - No inline registries exist inside Vault/nav.

### B2 — Vault Directory
**Story:** As a user, I can find any feature (even “hidden” ones) via Vault.
- Tasks:
  - Vault renders from registry.
  - Add filters (area, audience) + search.
  - Add “open” buttons.
- Acceptance:
  - Vault never renders links user cannot access.
  - Vault exposes all accessible features.

### B3 — Integrity Diagnostics (admin-only)
**Story:** As an admin, I can run integrity checks and export a report.
- Tasks:
  - Implement `/integrity` page.
  - Checks: registry vs router, tenancy heuristics, leakage heuristics.
  - Add “Export report” JSON.
- Acceptance:
  - Page never crashes; shows warnings instead.
  - Export works and includes timestamp + tenant id.

---

## Epic C — Signup & Onboarding
### C1 — Student signup controls
- Invite code flow
- Domain match flow
- Approval queue flow
Acceptance:
- A student cannot join a tenant without meeting one of the configured rules.

### C2 — Teacher signup controls
- Invite-only preferred
- Approval fallback
Acceptance:
- Teacher role is never self-assigned without admin approval.

### C3 — School/Entity signup
- Create pending tenant application
- Create owner/admin account
- Admin onboarding wizard
Acceptance:
- Tenant exists in `pending` until approved.
- After approval, admin can complete onboarding.

### C4 — Invitations lifecycle
- Create invitations (role + tenant + expiry)
- Accept once; invalidate token
- Revoke membership; audit log
Acceptance:
- Tokens cannot be reused.
- Revoke removes access immediately.

---

## Epic D — Design System + Revamp
### D1 — Theme tokens
- Light/dark/night
- Typography scale
Acceptance:
- No pure-white backgrounds; reading surfaces comfortable.

### D2 — Shared components
Acceptance:
- All portals use the shared button/input/table/card.
- Tables collapse to cards on mobile.

### D3 — Module conversions (safe order)
- Dashboard -> Courses -> Lesson chrome -> Admin settings -> Monetization -> Tools
Acceptance:
- Each conversion preserves behavior; adapters used where needed.

---

## Epic E — Security + Content Protection Stability
### E1 — Lesson access gating correctness
Acceptance:
- LOCKED/DRIP_LOCKED: no material fetch/render/mount.
- UNLOCKED: materials engine can fetch/render.

### E2 — Downloads protection
Acceptance:
- No URL visible unless authorized; “Get download” logs event.

### E3 — Search leakage prevention
Acceptance:
- Search is metadata-only; never queries full transcripts for unauthorized.

### E4 — Rate limiting / abuse protections
Acceptance:
- Auth endpoints and download reveal are rate-limited (best-effort).

---

## Epic F — Storefront + Monetization polish
- Branding surfaces
- Checkout idempotency
- Coupons
- Affiliate dashboards + payouts
Acceptance:
- Approving same transaction twice creates no duplicate entitlements.
- Creating same payout batch twice creates no duplicates.

---

## Epic G — Release & Recovery
- Update CHANGELOG
- Update RECOVERY “how to recover” steps
- Export integrity report sample
Acceptance:
- Someone can resume work after interruption using RECOVERY.
