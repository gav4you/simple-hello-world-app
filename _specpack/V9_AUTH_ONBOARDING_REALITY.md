# Auth, Audience, and Onboarding (Reality + Plan)
Prepared: January 01, 2026 (Asia/Jerusalem)

## Current authentication model (v9.0)
- Auth provider: Base44 SDK
- Auth state lives in:
  - `src/lib/AuthContext.jsx`
- Login redirect:
  - `base44.auth.redirectToLogin(window.location.href)`
- Logout:
  - `base44.auth.logout(...)`

Important nuance:
- Base44 login is not implemented as an in-app route page in this ZIP.
- The app can be configured to require auth; storefront routes attempt to remain guest-safe.

## Current session model (v9.0)
- `src/components/hooks/useSession.jsx` is the “single source of truth” for:
  - user
  - memberships
  - activeSchoolId
  - role
  - audience (student/teacher/admin)

Audience is derived from role via:
- `normalizeAudienceFromRole()` in `src/components/config/features.jsx`

## New requirement: separate login pages
We will implement **in-app routes** that still use Base44 auth, but provide:
- distinct URLs
- distinct messaging and “what happens next”
- persistent audience intent

### Proposed new routes (add explicit routes in `src/App.jsx`)
- `/login/student`
- `/login/teacher`
- `/login/admin` (optional)
- `/signup` (router)
- `/signup/student`
- `/signup/teacher`
- `/signup/school`

### How these routes work (no guessing)
1) Render a lightweight page explaining the path (student vs teacher).
2) Store “intended audience” in localStorage:
   - `ba_intended_audience = student|teacher|admin`
3) Call `base44.auth.redirectToLogin()` when user clicks continue.
4) After return, `useSession` loads user + memberships:
   - If user has no memberships → route to onboarding wizard
   - If multiple schools → route to `SchoolSelect`
   - Else → route to portal home

## Onboarding (already exists in parts)
Existing pages you can reuse/extend:
- `SchoolSelect` (`src/pages/SchoolSelect.jsx`)
- `SchoolJoin` (`src/pages/SchoolJoin.jsx`)
- `SchoolNew` (`src/pages/SchoolNew.jsx`)
- Invite acceptance:
  - `InviteAccept` (`src/pages/InviteAccept.jsx`)

## New requirement: school/entity signup
We will extend `SchoolNew` into a true “application” workflow:
- `SchoolApplication` entity (new) OR reuse an existing application-style entity if present in backend.
- status lifecycle: `pending → approved → active` (or `rejected`)
- approval UI: place in Admin portal (see roadmap)
