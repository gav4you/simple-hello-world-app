# Architecture North Star (v9.0)
Prepared: January 01, 2026 (Asia/Jerusalem)

This document defines the target architecture that keeps all existing features while adding:
- Public marketing website
- Separate Student/Teacher portals + separate login entry points
- School/Entity signup + onboarding (multi-tenant)
- Full premium UI/UX revamp (WOW, calm, academic)

---

## 1) App Shell (React/Vite/Base44-style assumptions)
The existing project references a Vite alias of `@` -> `./src` and a Base44-style router/pages structure.
**Do not assume exact paths**; Phase 0 audit must confirm real file locations.

### 1.1 Single session source-of-truth
Create or harden a session hook/provider that exposes:
- `user` (identity)
- `memberships[]` (tenant memberships + roles)
- `activeSchoolId` + `activeSchoolSlug`
- `audience` (student | teacher | admin | superadmin)
- `isLoading`, `isAuthenticated`

Rules:
- Audience is derived from **role claims** and/or portal entry point.
- Active school is chosen by:
  1) explicit selector (for multi-tenant users)
  2) last-used in localStorage (scoped)
  3) fallback to first membership
- Store **only non-sensitive** session hints client-side.

### 1.2 Multi-surface routing
We split surfaces by route groups:
- Public marketing: `/`, `/about`, `/faq`, etc.
- Student portal: `/student/*`
- Teacher portal: `/teacher/*`
- School admin: `/admin/*`
- Platform admin: `/superadmin/*` (global-only)
- Public storefront: `/s/:schoolSlug/*`

Legacy routes must remain working via:
- alias routes in registry
- redirect adapters that preserve query strings

### 1.3 Guard layers
Every protected surface requires *both*:
- **Route guard**: blocks UI rendering if role/tenant missing
- **Data guard**: all queries/mutations are server/app-layer protected by tenant + entitlement

---

## 2) Tenant & RBAC Model
### 2.1 Core concepts
- `Tenant` (School/Entity) — owns courses, lessons, offers, settings, staff, branding.
- `Membership` — ties user to tenant + role(s).
- `Role` — student/teacher/admin/owner/superadmin

### 2.2 Tenant scoping enforcement
- Never trust client-provided `tenant_id`.
- Derive tenant scope from:
  - `activeSchoolId` for authenticated portal requests
  - `schoolSlug -> school_id` for public storefront

---

## 3) Content Protection & Materials Engine
### 3.1 Access states (MUST)
- `LOCKED` — no entitlement
- `DRIP_LOCKED` — has entitlement, but not released yet
- `UNLOCKED` — entitled + released

**Hard rule:** In `LOCKED` or `DRIP_LOCKED`, lesson materials must not be fetched, rendered, mounted, nor passed into components.

### 3.2 Materials engine contract
The engine returns:
- `accessState`
- `reasons[]` (why locked)
- `unlockAt` (for drip)
- `preview` (if allowed by policy)
- `materials` only when `UNLOCKED`

---

## 4) Feature Registry + Vault as the anti-loss safety net
One typed registry drives:
- Main navigation (streamlined)
- Vault (full directory)
- Optional command palette
- Integrity checks

Registry must be a central module (`src/config/features.*` or `src/registry/featureRegistry.*`).
Never inline registry arrays in UI pages.

---

## 5) Observability & Integrity Contract
An admin-only `/integrity` diagnostic must:
- validate registry vs router existence (best-effort)
- validate scoping heuristics
- validate leakage heuristics (materials not fetched while locked)
- export JSON report

---

## 6) Delivery constraints
- Extend-not-replace: prefer additive changes and adapters.
- No feature deletions. If nav is simplified, keep feature in Vault.
- “Build must pass” is a requirement — fix root causes (aliases/imports/guards), not symptoms.
