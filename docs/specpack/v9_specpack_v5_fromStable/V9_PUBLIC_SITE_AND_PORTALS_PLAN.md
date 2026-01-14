# Public Website + Separate Portals (Design + Implementation Plan)
Prepared: January 01, 2026 (Asia/Jerusalem)

This document translates the “unified master plan” into **this exact v9.0 codebase**.

## Goal
Add:
1) Public marketing site (trust + conversion)
2) Separate portal experiences:
   - Student (`/student/*`)
   - Teacher (`/teacher/*`)
   - School Admin (`/admin/*`)
   - Super Admin (`/superadmin/*`)
3) Separate login URLs:
   - `/login/student`
   - `/login/teacher`
   - optional `/login/admin`

WITHOUT breaking:
- Existing Base44 legacy routes (`/:pageName`)
- Vault discoverability
- Tenancy invariants
- Access/entitlement gating

---

## A) Public marketing site
### New routes
- `/` (public landing if not signed in; otherwise route to portal)
- `/about`
- `/how-it-works`
- `/faq`
- `/contact`
- `/privacy`
- `/terms`

### Implementation approach (Vite + React Router)
1) Add explicit routes in `src/App.jsx` **above** the generic pages map.
2) Create new lightweight page components under:
   - `src/pages/public/` (recommended) OR `src/pages/` (keep simple)
3) Add feature registry entries (audiences: `public`, `hidden: true` for legal pages if desired)
4) Reuse existing design system:
   - `src/components/theme/tokens`
   - `GlassCard`, `PageShell`, `SectionHeader`

### Root routing logic
`/` should:
- show Landing if user is not authenticated
- show “select school” if user has multiple memberships and no active school
- show portal home if active school is set

---

## B) Portals
### New route groups
- `/student/*`
- `/teacher/*`
- `/admin/*`
- `/superadmin/*`

### The “smart” way (uses existing session audience)
Create a tiny router bridge:
- `src/components/routing/PortalGate.jsx`
Responsibilities:
1) Read current session: `useSession()`
2) Enforce allowed roles:
   - student portal: any membership role
   - teacher portal: instructor/TA/admin/owner
   - admin portal: admin/owner
   - superadmin: platform global admin (see roles helper)
3) Set `audience` in session (or localStorage intent) so nav renders correct items.
4) Render the **existing Layout** with portal-specific default route.

### Portal home pages
Define these defaults:
- Student: `/student/dashboard` → renders existing Dashboard module (or new StudentDashboard)
- Teacher: `/teacher/dashboard` → renders existing Teach / TeachAnalytics
- Admin: `/admin/dashboard` → renders existing SchoolAdmin / SchoolAnalytics
- Superadmin: `/superadmin/network` → renders NetworkAdmin + audit log

### Keep legacy routes
All existing routes remain working:
- `/dashboard`, `/Dashboard`
- `/teach`, `/Teach`
etc.

Over time we add gentle redirects:
- `/teach` → `/teacher/teach` (optional)
but only after stability is proven.

---

## C) Separate login pages
Add explicit routes:
- `/login/student`
- `/login/teacher`
- `/login/admin` (optional)

These pages:
- set intended audience
- explain what happens
- trigger `base44.auth.redirectToLogin()`

---

## D) School/entity signup
We already have `SchoolNew` and `SchoolJoin`.
We will evolve them into:
- `/signup/school` (application wizard)
- admin approvals inside `/admin/*`

---

## E) Navigation
The existing layout uses:
- `getNavGroupsForAudience(audience)` from the registry
So portals become “real” immediately once audience is set.

We will add:
- Portal switch links (if user has multiple roles)
- Distinct portal topbars (colors/icons) without duplicating logic
