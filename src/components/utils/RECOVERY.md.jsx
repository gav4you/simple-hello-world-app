# RECOVERY GUIDE

How to recover from common issues and locate critical components.

---

## Feature Registry

**Location:** `components/config/features.jsx`

Single source of truth. Never inline registry elsewhere.

**Adapters:** `components/utils/featureRegistry.js`, `components/utils/scopedQueries.js`

**If imports break:**
1. Verify Vite alias `@` → `./src`
2. Check jsconfig.json paths
3. Never inline registry
4. Run `/integrity` diagnostics

---

## Vault

**Location:** `pages/Vault.jsx`

Access to ALL features, including vault-only pages.

**NEVER delete Vault** - it's the safety net.

---

## Content Protection

**Policy:** `ContentProtectionPolicy` entity (school-scoped)

**Access Levels:**
- FULL: Complete access
- PREVIEW: Truncated (90s video, 1500 chars text)
- LOCKED: Paywall/AccessGate

**Configuration:** School Admin → Protection tab

---

## Multi-Tenant Scoping

**Canonical:** `components/api/scoped.js`

**Validation:** `/integrity` page

**If leakage:** Verify `scopedFilter(entity, schoolId, ...)` usage

---

## Storefront Routing

**Canonical:** `/s/:schoolSlug/*` routes

**Legacy:** Query params preserved (`?slug=`, `?courseId=`)

**Context:** `components/hooks/useStorefrontContext.js`

---

## Entitlements

**Logic:** `components/utils/entitlements.jsx`

**Types:** ALL_COURSES, COURSE, COPY_LICENSE, DOWNLOAD_LICENSE, SUBSCRIPTION

**Granting Functions:**
- `createEntitlementsForPurchase(transaction, offer, schoolId)`
- `createEntitlementsForSubscription(subscription, offer, schoolId)`
- `processReferral(transaction, schoolId)` - handles affiliate commissions

---

## Security Verification

**Page:** `/integrity` (admin-only)

**Checks:** Registry, routing, scoping, OAuth, protection

---

## If System Breaks

1. **Router:** Check registry alignment
2. **Imports:** Verify @ alias
3. **Registry:** Add to features.jsx, don't inline
4. **Scoping:** Run /integrity, fix queries
5. **Protection:** Verify useLessonAccess
6. **OAuth:** Check env vars

---

## Critical Files (Never Delete)

- components/config/features.jsx
- components/api/scoped.js
- components/hooks/useLessonAccess.js
- components/protection/ProtectedContent.js
- components/security/AccessGate.js
- pages/Vault.jsx
- pages/Integrity.jsx

---

Last Updated: 2025-12-28