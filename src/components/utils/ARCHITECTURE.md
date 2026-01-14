# ARCHITECTURE

High-level architecture of Breslov Academy platform.

---

## System Overview

**Multi-tenant white-label LMS** with content protection and monetization.

**Paradigm:** Teachable + MasterClass + Sefaria  
**Stack:** React + Base44 BaaS + Tailwind

---

## Session Model

**User:** `base44.auth.me()`  
**Active School:** `localStorage.getItem('active_school_id')`  
**Roles:** OWNER, ADMIN, INSTRUCTOR, TA, MODERATOR, STUDENT

---

## Multi-Tenant Scoping

**Module:** `src/components/api/scoped.jsx`

**Entity list:** `src/components/api/scopedEntities.js`

**Rule:** ALL school-scoped queries MUST include `school_id` filter.

**Functions:** scopedList, scopedFilter, scopedCreate

### Runtime Tenancy Guard (Defense-in-depth)

Because legacy code may still call `base44.entities.*` directly, we install a runtime guard
that auto-injects `school_id` for school-scoped entities.

**Installer:** `src/api/base44Client.js` (calls `installTenancyEnforcer()`)

**Guard:** `src/components/api/tenancyEnforcer.js`

**Runtime context:** `src/components/api/tenancyRuntime.js` (synced via `src/components/api/TenancyBridge.jsx`)

**Global admin escape hatch:** `.filterGlobal()` / `.listGlobal()` on school-scoped entities (used by NetworkAdmin).

---

## Content Protection

**Access Levels:**
1. FULL: Entitled → full content
2. PREVIEW: Preview enabled → truncated
3. LOCKED: No access → AccessGate paywall

**Licensing:** ADDON mode requires course access AND license.

**Implementation:** useLessonAccess → ProtectedContent → AccessGate

---

## Monetization

**Flow:** Offers → Transactions → Approval → Entitlements

**Offer Types:** COURSE, BUNDLE, SUBSCRIPTION, ADDON

**Approval:** Admin marks pending transactions as completed

**Entitlements:** ALL_COURSES, COURSE, COPY_LICENSE, DOWNLOAD_LICENSE

---

## Affiliate Tracking

**Flow:**
1. Referral link `?ref=code`
2. Code in localStorage
3. Attached to transaction
4. Commission calculated on approval

---

## Storefront Routing

**Canonical:** `/s/:schoolSlug/*` (public)  
**Legacy:** `/SchoolLanding?slug=...` (preserved)  
**Context:** `useStorefrontContext` hook

---

## Feature Registry

**Location:** `components/config/features.jsx`

**Usage:** Vault, Navigation, Command Palette, Integrity

**Rule:** Never inline.

---

## Data Protection Layers

1. **UI:** ProtectedContent wrapper
2. **Access:** useLessonAccess enforcement
3. **Query:** scopedFilter scoping
4. **Backend:** (future) entity permissions, signed URLs

---

## Integrity Diagnostics

**Page:** `/integrity` (admin-only)

**Checks:** Registry, routing, scoping, OAuth, protection

---

## Platform Limitations

1. No server-side rendering → UI-only protection
2. No entity permissions → app-layer checks
3. No signed URLs → entitlement checks before links
4. No scheduled jobs → manual renewal
5. OAuth token exchange → use app connectors

---

Last Updated: 2025-12-30

---

## v8.9 — Contracts + Safety Scans

This version adds a *diagnostics-first* safety layer to reduce the chance of regressions:

### Query Contracts

- `src/components/api/contracts.js` provides `normalizeLimit()` to cap read limits (default 50, max 200).
- `src/components/api/scoped.jsx` applies `normalizeLimit()` for scoped reads to avoid accidental unbounded queries.

### Runtime Tenant Warning Channel

- `src/components/api/tenancyWarnings.js` stores a bounded list of runtime warnings.
- `src/components/api/tenancyEnforcer.js` now records warnings when it blocks or coerces queries.
- `/integrity` displays these warnings and lets admins clear after investigation.

### Static Code Scanner

- `src/components/system/codeScanner.js` runs conservative regex scans on curated high-risk modules loaded as `?raw`.
- Results appear in `/integrity` alongside other checks.