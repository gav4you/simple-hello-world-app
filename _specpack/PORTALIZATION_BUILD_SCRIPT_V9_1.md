# Portalization & Public Site — Step-by-Step Build Script (v9.1.x)
Prepared: January 01, 2026 (Asia/Jerusalem)

This is the “do this, then this” plan that we will follow in the next coding chat.

---

## PR v9.1.0 — Public Landing + Separate Logins
### Goal
- Guest-friendly public site at `/`
- Dedicated login routes:
  - `/login/student`
  - `/login/teacher`
- No breakage to existing `/dashboard` etc.

### Code tasks (ordered)
1) **Add new pages**
   - Create folder: `src/pages/public/`
   - Files:
     - `Landing.jsx`
     - `About.jsx`
     - `HowItWorks.jsx`
     - `FAQ.jsx`
     - `Contact.jsx`
     - `Privacy.jsx`
     - `Terms.jsx`

2) **Add login pages**
   - Create folder: `src/pages/auth/`
   - Files:
     - `LoginStudent.jsx`
     - `LoginTeacher.jsx`
   - Each page:
     - uses `base44.auth.redirectToLogin()` on CTA click
     - writes `ba_intended_audience` in localStorage

3) **Wire routes**
   - Edit: `src/App.jsx`
   - Add explicit routes **above** the quizzes/storefront routes:
     - `/about`, `/how-it-works`, etc.
     - `/login/student`, `/login/teacher`
   - Update root (`/`) behavior:
     - If authenticated + active school → redirect to appropriate portal home
     - Else show Landing

4) **Integrate with feature registry (optional but recommended)**
   - Edit: `src/components/config/features.jsx`
   - Add features for public pages (audience: public, `hidden: true` for legal pages)

5) **Nav split**
   - Add a “public top nav” inside the public pages (not the main Layout)
   - Keep existing Layout untouched for authenticated portals.

### Acceptance checks
- Guest can load `/` without errors
- Guest can navigate to `/about`, `/faq`, etc.
- Clicking “Student Login” redirects to Base44 auth
- After login return:
  - If no school selected: go to `SchoolSelect`
  - Else: go to `/student/dashboard` (later PR) or existing `/dashboard`

---

## PR v9.1.1 — Portal Route Groups (Student/Teacher/Admin)
### Goal
- URL namespaces for clarity and future expansion:
  - `/student/*`
  - `/teacher/*`
  - `/admin/*`
- Role gates enforced for teacher/admin

### Code tasks (ordered)
1) Add portal router helpers:
   - `src/components/routing/PortalGate.jsx`
   - `src/components/routing/RequireRole.jsx` (small RBAC helper)

2) Extend router:
   - Edit: `src/App.jsx`
   - Add route groups:
     - `/student/*` → element `<PortalGate audience="student" />`
     - `/teacher/*` → `<PortalGate audience="teacher" />`
     - `/admin/*` → `<PortalGate audience="admin" />`

3) Inside PortalGate:
   - Read session via `useSession()`
   - Validate membership + role
   - Set audience intent (localStorage + optional context setter)
   - Render the existing Layout or redirect to canonical pages

4) Add initial portal home redirects:
   - `/student` → `/student/dashboard`
   - `/teacher` → `/teacher/teach` (or `/teacher/dashboard`)
   - `/admin` → `/admin/schooladmin`

### Acceptance checks
- Student cannot load `/admin/*`
- Teacher can load `/teacher/*` and still access `/teach/*`
- Legacy routes keep working

---

## PR v9.1.2 — Portal Switching + Audience Persistence
### Goal
If a user is:
- teacher in one school, student in another, etc…
they can switch portals cleanly.

Tasks:
- Add portal switcher in `src/Layout.jsx` topbar when multiple roles
- Persist last chosen portal per school:
  - `ba_portal_pref:{schoolId} = student|teacher|admin`
- On login return, choose portal:
  - use stored preference, else infer from role, else default student

---

## PR v9.1.3 — Onboarding Routing Cleanup
- Make “no memberships” user experience clean:
  - show wizard to create/join school
  - never dump them into empty dashboard
- Ensure SchoolSelect is always reachable and stable.

---

## PR v9.1.4 — Polish & Accessibility
- Keyboard nav for public site
- ARIA for nav + dialogs
- “reduced motion” check for animations
- Perf pass: lazy load heavy pages, defer charts
