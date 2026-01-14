# ROADMAP v9.0 — Extremely Detailed Execution Plan
Prepared: January 01, 2026 (Asia/Jerusalem)

This roadmap is written to be executed **after you upload the v9.0 zip**.
It assumes the project already includes v7 security + v8 monetization foundations, and v9 adds:
- Public marketing site
- Split portals/logins
- Tenant signup/onboarding
- Premium design system shell + module conversion

---

# Phase 0 — Zip Intake, Audit, and “Truth Map” (NO DELETIONS)
## Objective
Build a factual map of the codebase (routes, layouts, entities, hooks) so we can refactor safely.

## Tasks
### 0.1 Project bootstrap
- Unzip v9.0 locally
- Install deps
- Run dev server
- Confirm build passes (or capture exact error list)

### 0.2 Identify canonical files (write them down)
Find:
- Router entry file(s)
- Layout/nav shell file(s)
- Vault page file
- Session/auth provider/hook (e.g., `useSession`)
- Tenant scope helpers (e.g., `useStorefrontContext`, `activeSchoolId`)
- Lesson access hook (e.g., `useLessonAccess`)
- Entities folder (Base44 often uses `entities/*.json`)

### 0.3 Create/verify append-only docs (create-if-missing)
- `CHANGELOG.md` (append-only)
- `RECOVERY.md`
- `ARCHITECTURE.md`
- `KNOWN_ISSUES_TECH_DEBT.md`

### 0.4 Build the “Truth Map” tables (in docs)
In `ARCHITECTURE.md`, add:
- Where is Feature Registry?
- Where is Vault?
- Where is content protection policy?
- Where is monetization configuration?
- Where are tenant settings (terminology, branding)?
- Where is integrity page?

### 0.5 Risk scan
- Search for any queries that fetch lessons/materials without gating
- Search for any entities queried without tenant scoping
- Locate any old/legacy routes that must remain

## Acceptance criteria
- App builds or we have a logged exact error list
- We have a written map of the files above
- Docs exist and are append-only

---

# Phase 1 — Aliases + Import Hardening (Fix root causes)
## Objective
Prevent “auto-fix” regressions by ensuring `@/` imports resolve reliably.

## Tasks
- Confirm Vite alias `@` -> `./src`
- Confirm jsconfig/tsconfig paths `@/*` -> `src/*`
- Replace incorrect relative imports with `@/...` consistently

## Acceptance criteria
- No “module not found” errors for central imports
- Feature registry is importable from one stable module

---

# Phase 2 — Central Feature Registry + Vault Enforcement
## Objective
Re-establish one source of truth for navigation + Vault + integrity.

## Tasks
### 2.1 Registry module
- Create/restore registry module file
- Populate registry from **actual router map**
- For each feature:
  - define canonical route
  - define aliases (legacy)
  - assign `area`, `audiences`, `vaultOnly`, `showInMainNav`

### 2.2 Vault
- Remove any inline registry list
- Vault renders from registry
- Add search/filter UI
- Add badges (area, audience)

### 2.3 Layout nav
- Build nav groups:
  - Core (always)
  - Teach (teacher/admin)
  - Admin (admin/owner)
  - Labs (optional)
  - Vault (always)

### 2.4 Integrity
- Ensure integrity page exists and reads registry
- Add export JSON report

## Acceptance criteria
- Vault shows every feature (permission-filtered)
- No inline feature lists remain
- Legacy routes work via aliases/redirects
- Integrity report exports without crashing

---

# Phase 3 — v9 Surface Split: Public Site + Separate Logins + Portal Layouts
## Objective
Implement new product surfaces while keeping old routes working.

## Tasks
### 3.1 Public marketing site
- Implement required marketing routes with premium layout
- Add top nav links to the correct login/signup pages

### 3.2 Separate login pages
- Implement `/login/student`, `/login/teacher` (+ optional admin)
- Maintain existing `/login` as legacy redirect chooser
- Ensure post-login routing sends user to correct portal based on role + chosen audience

### 3.3 Portal shells
Create distinct shells:
- StudentShell
- TeacherShell
- AdminShell
- SuperAdminShell

### 3.4 Route guards
- Add guard wrappers per portal
- Ensure tenant is selected/derived before rendering portal pages

### 3.5 Legacy compatibility
- Keep old portal routes accessible (aliases), progressively migrate canonical to new route groups

## Acceptance criteria
- Login entry points land in correct portal
- Guards block unauthorized access
- Old deep links still function

---

# Phase 4 — Signup + Onboarding (Individuals + Schools/Entities)
## Objective
Enable controlled onboarding with approvals + invites while preserving security.

## Tasks
### 4.1 Individual signup
- `/signup` chooser, `/signup/student`, `/signup/teacher`
- Student join rules: invite code OR domain match OR approval queue
- Teacher join rules: invite-only OR approval

### 4.2 School/entity signup
- `/signup/school`
- Create pending application + tenant record
- Create owner/admin account or link existing
- Onboarding wizard in `/admin/onboarding`

### 4.3 Invitations lifecycle
- Create invitations with expiry + role + tenant
- Accept flow:
  - token -> attach membership -> mark accepted -> invalidate token
- Revoke flow:
  - remove membership -> audit log

## Acceptance criteria
- Tenant signup submission works end-to-end (pending -> approved -> onboard)
- Invites work and cannot be reused
- Approvals queue visible to admins

---

# Phase 5 — Design System Shell + UI Revamp (No feature breakage)
## Objective
Deliver the new premium UI without breaking functionality.

## Tasks
- Implement tokens + light/dark/night themes
- Build/standardize base components
- Build LMS components (course cards, access gates, progress)
- Replace global shell first, then convert modules in safe order

## Acceptance criteria
- UI consistent across portals
- No regressions in gating/monetization
- Mobile-first behavior for heavy tables

---

# Phase 6 — Security + Correctness Hardening (v9 stability)
## Objective
Lock down leakage vectors and correctness in money flows.

## Tasks
- Confirm lesson materials never fetched while locked/drip-locked
- Confirm downloads never expose URLs unauthorized
- Confirm search is metadata-only
- Rate limit auth + checkout + downloads
- Expand audit logs coverage

## Acceptance criteria
- Integrity checks pass or show actionable warnings
- Manual smoke tests pass

---

# Phase 7 — Storefront + Monetization polish (if needed)
## Objective
Ensure storefront is premium and operationally correct.

## Tasks
- School branding polish
- Offers/bundles/subscriptions UX
- Coupon UX improvements
- Affiliate dashboard + payouts polish
- Account portal improvements

---

# Phase 8 — QA, Release Packaging, and “v9.0 Stable” Cut
## Objective
Ship a stable build and recovery playbook.

## Tasks
- Final regression checklist
- Update CHANGELOG with v9.0 entry
- Update RECOVERY with “how to restore”
- Export integrity report JSON sample
- Package stable zip


## Phase 0 Add-on — Repo Reality Snapshot (mandatory)
- Run the protocol in `REPO_REALITY_AUDIT.md`.
- Paste the snapshot into the coding chat (or commit under `docs/repo-snapshot.md`).
- Replace any assumption placeholders in docs with exact file paths and routes.
