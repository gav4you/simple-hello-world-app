# Roadmap — Extreme Detail (v9.1 → v10+)
Prepared: January 01, 2026 (Asia/Jerusalem)

This roadmap is designed to be used as the “coding script” in the next chat.
It assumes v9.0-stable is the starting baseline (this ZIP).

---

# Guiding rules (non-negotiable)
1) No features removed — Vault remains the complete registry.
2) Tenancy is enforced everywhere:
   - use `scoped*` for school-scoped entities
   - keep runtime enforcer enabled
3) Access gating is enforced everywhere:
   - never fetch premium materials in LOCKED/DRIP_LOCKED
   - never fetch quiz questions in LOCKED
4) Prefer production-grade solutions:
   - route guards + server checks
   - audit logs for admin actions
   - idempotency for money

---

# Phase 0 — Intake & Reality Lock (1 PR)
## Deliverables
- [ ] “Reality Map” docs committed under `docs/`:
  - Codebase map
  - Route map
  - Feature registry dump
  - Tenancy/access invariants
- [ ] Add missing FEATURES registry entries:
  - `TeachQuizEditor` (hidden)
  - `QuizTake` (hidden)
- [ ] Ensure `npm run build` passes (typecheck + lint)

## Files
- `src/components/config/features.jsx`
- `docs/V9_CODEBASE_MAP.md` (new)
- `docs/V9_ROUTE_MAP.md` (new)

## Acceptance tests
- [ ] Vault still renders and lists all features
- [ ] `/teach/quizzes/new` and `/quiz/:id` still work
- [ ] No new console errors in Layout

---

# Phase 1 (v9.1) — Public Site + Login Split + Portal Shells
Goal: get the big UX architecture in place without touching deep LMS logic.

## 1.1 Public landing + trust pages
### Tasks
- [ ] Create pages:
  - `Landing`
  - `About`
  - `HowItWorks`
  - `FAQ`
  - `Contact`
  - `Privacy`
  - `Terms`
- [ ] Add explicit routes in `src/App.jsx` (above generic map)
- [ ] Add FEATURE registry entries (audience: public) where appropriate
- [ ] Add SEO basics (title/meta) using `react-helmet-async` (new dep) OR minimal `document.title` per page

### Acceptance
- [ ] Guest sees landing at `/`
- [ ] Authenticated user is routed to portal home
- [ ] Lighthouse is “good enough” (no huge images; lazy load)

## 1.2 Separate login URLs
### Tasks
- [ ] Add routes:
  - `/login/student`
  - `/login/teacher`
  - optional `/login/admin`
- [ ] Store intended audience (localStorage)
- [ ] Call `base44.auth.redirectToLogin()`

### Acceptance
- [ ] Each login page works and returns user correctly
- [ ] Intended portal experience loads after return

## 1.3 Portal route groups (no feature breakage)
### Tasks
- [ ] Add route groups:
  - `/student/*`
  - `/teacher/*`
  - `/admin/*`
  - `/superadmin/*`
- [ ] Add `PortalGate` component:
  - checks session
  - enforces roles
  - sets audience
- [ ] Add portal home routes:
  - `/student/dashboard`
  - `/teacher/dashboard`
  - `/admin/dashboard`

### Acceptance
- [ ] Teacher cannot access student portal routes that require teacher privileges
- [ ] Admin portal blocks non-admin
- [ ] Legacy routes still work unchanged

---

# Phase 2 (v9.2) — Onboarding & School/Entity Signup (Multi-tenant excellence)
## 2.1 School signup “application”
- [ ] Route: `/signup/school`
- [ ] Wizard steps:
  1) org info
  2) owner info
  3) confirm
- [ ] Create pending school record (or SchoolApplication entity)
- [ ] Send confirmation + show status page

## 2.2 Invites + approvals
- [ ] Admin portal:
  - approvals queue
  - invite teacher/student
- [ ] Invite accept flow hardening:
  - `InviteAccept` page (already exists)

## 2.3 Tenant settings
- [ ] `ContentProtectionSettings` component already exists:
  - wire into Admin portal settings
- [ ] add audit logs on every policy change

---

# Phase 3 (v9.3) — Student Learning WOW
Focus: learning flow clarity and delight.

- [ ] Student dashboard redesign (KPI cards, next lesson, streak)
- [ ] Course detail page:
  - clean curriculum
  - progress
  - locked vs preview states
- [ ] Lesson viewer:
  - make AccessGate first-class
  - preview trimming enforced
  - better media player UX
- [ ] Reader:
  - night mode
  - highlights/notes (if entity exists)

---

# Phase 4 (v9.4) — Teacher Power Tools
- [ ] Course builder UX (drag/drop lessons, bulk actions)
- [ ] Quiz authoring upgrades:
  - question bank
  - import/export
  - analytics
- [ ] Grading workflow improvements (assignments/submissions)

---

# Phase 5 (v9.5) — Storefront Conversion & Trust
- [ ] School landing improvements (hero, testimonials, FAQs)
- [ ] Pricing page:
  - bundles + add-ons display
- [ ] Checkout reliability:
  - idempotency
  - post-checkout entitlement verification
- [ ] Affiliate tracking + attribution hardening

---

# Phase 6 (v9.6) — Observability + QA + Performance Budgets
- [ ] Add GitLab CI/CD CI:
  - lint + typecheck + build
- [ ] Add minimal unit tests:
  - tenancy scoping
  - access gating (no fetch when locked)
  - money idempotency guards
- [ ] Add performance budgets:
  - route-based code splitting
  - image size checks

---

# Phase 7 (v10) — Major upgrades (only after stable loop works)
- Feature flags framework
- Multi-language content authoring
- Integrations marketplace
