# IA + Route Map (Public + Portals + Storefront) — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

This is the canonical route map. It must be implemented without breaking existing routes.

---

## 1) Public Marketing Website (Trust + Conversion)
Routes (required):
- `/` — landing (premium hero, value props, CTA)
- `/about`
- `/how-it-works`
- `/faq`
- `/contact`
- `/privacy`
- `/terms`

Top nav (required):
- Student Login -> `/login/student`
- Teacher Login -> `/login/teacher`
- Sign Up -> `/signup` (if enabled)
- School/Entity Sign Up -> `/signup/school` (or Request Demo)

Implementation:
- Public site uses marketing layout shell.
- Must not require authentication.

---

## 2) Auth Entry Points (Separate Login Pages)
- `/login/student`
- `/login/teacher`
- `/login/admin` (optional)
- `/login` (legacy) -> redirect to chooser

Rules:
- All login pages use same underlying auth mechanism.
- Each login page sets desired audience, then routes to correct portal post-login.

---

## 3) Signup & Onboarding
### 3.1 Individual signup
- `/signup` (chooser)
- `/signup/student`
- `/signup/teacher`

Controls:
- Student: invite code OR domain match OR pending approval.
- Teacher: invite-only OR pending approval.

### 3.2 School/Entity signup (Tenant creation)
- `/signup/school`

Flow:
1) Submit org info -> create `TenantApplication` or `Tenant` in `pending`
2) Create Owner/Admin account or tie to existing user
3) Tenant onboarding wizard in `/admin/onboarding`

---

## 4) Portals (Separate Layouts)
### 4.1 Student portal: `/student/*`
Minimum pages:
- `/student/dashboard`
- `/student/courses`
- `/student/course/:courseId`
- `/student/lesson/:lessonId` (lesson viewer)
- `/student/assignments`
- `/student/progress`
- `/student/messages`
- `/student/account` (or `/account` alias)

### 4.2 Teacher portal: `/teacher/*`
Minimum pages:
- `/teacher/dashboard`
- `/teacher/classes`
- `/teacher/course-builder` (or existing course builder route)
- `/teacher/grading`
- `/teacher/analytics`
- `/teacher/messages`

### 4.3 School admin portal: `/admin/*`
Minimum pages:
- `/admin/onboarding`
- `/admin/users`
- `/admin/invites`
- `/admin/classes`
- `/admin/settings` (branding, terminology, protection policy)
- `/admin/approvals`
- `/admin/monetization` (if already exists)
- `/admin/audit-logs`
- `/admin/migration-tools`
- `/admin/integrity` (or `/integrity` vault-only)

### 4.4 Platform admin: `/superadmin/*`
Minimum pages:
- `/superadmin/tenants`
- `/superadmin/users`
- `/superadmin/risk-audit`
- `/superadmin/impersonation`
- `/superadmin/system`

Lockdown:
- Global role only
- Must be audited

---

## 5) Public Storefront (Per school slug)
Canonical:
- `/s/:schoolSlug` (school landing)
- `/s/:schoolSlug/catalog`
- `/s/:schoolSlug/course/:courseId` (sales page)
- `/s/:schoolSlug/pricing` (or offers)
- `/s/:schoolSlug/checkout`
- `/s/:schoolSlug/thank-you`

Rules:
- Guests may browse marketing + storefront.
- Lesson content never shown here beyond preview policy.

---

## 6) Legacy routes & compatibility
During Phase 0 audit, enumerate all existing routes and:
- set each to a canonical route in the registry
- add `aliases[]` for old routes
- add redirect adapters preserving query strings

Deliverable:
- Append a “Legacy Route Map” section after audit listing each old route -> new route.
