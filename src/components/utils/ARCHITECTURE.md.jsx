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

**Module:** `components/api/scoped.js`

**Rule:** ALL school-scoped queries MUST include `school_id` filter.

**Functions:** scopedList, scopedFilter, scopedCreate

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

Last Updated: 2025-12-28