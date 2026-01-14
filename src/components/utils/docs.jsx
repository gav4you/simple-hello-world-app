// PLATFORM DOCUMENTATION - Recovery & Architecture
// Since .md files cannot be created at root, documentation is stored here

export const CHANGELOG = `
# Changelog

## v7.0 (Foundation Complete)
- Feature preservation via Vault (40+ pages maintained)
- Multi-tenant scoping with activeSchoolId enforcement
- Content protection system with ProtectedContent wrapper
- Admin policy configuration (watermark, copy/print/download blocking)
- Preview limits (max_preview_seconds, max_preview_chars)
- Monetized license add-ons (COPY_LICENSE, DOWNLOAD_LICENSE)
- Entitlements system for access control
- Terminology system (Rav/Rabbi + talmid/bachur configurable per school)
- Session management with SessionProvider
- Multi-school support with SchoolSwitcher

## v7.1 (Registry + Import Hardening) - 2025-12-28
- CRITICAL FIX: Restored centralized Feature Registry (components/config/features.js)
- Removed inline feature list from Vault page
- Fixed "@" alias imports throughout codebase
- Added Command Palette (Cmd/Ctrl+K) for quick navigation
- Updated Layout navigation to use registry
- Created /integrity diagnostics page for system validation
- All 40+ features cataloged and accessible via Vault
- Scoped query helpers (components/api/scoped.js) for multi-tenant safety

## v7.2 (Content Protection Enforcement) - 2025-12-28
- ProtectedContent wrapper with watermark + copy/print blocking
- Access gating: FULL/PREVIEW/LOCKED in LessonViewer + Reader
- Search leakage prevention (metadata-only for non-entitled)
- Downloads protection with canDownload checks
- Highlights scoped to school+user

## v8.0 (White-Label Storefront & Monetization) - 2025-12-28
- Multi-school storefront routes with legacy compatibility
- School branding system (logo, colors, typography)
- Public catalog and course sales pages (Teachable-style)
- SchoolPricing page with offer cards
- Checkout flow with coupon support
- Post-checkout thank-you with upsell CTAs
- Affiliate program with referral tracking (school-scoped)
- SchoolMonetization dashboard (transactions/offers/coupons)
- Transaction approval workflow with entitlement grants
- Bundle and subscription support
- Content licensing add-ons (copy/download rights)
- Payout tracking for affiliates and instructors
- Terminology Settings in School Admin
`;

export const RECOVERY = `
# Recovery Guide

## Feature Registry
**Location:** components/config/features.js
**Single source of truth** for all features, routes, and navigation.

**NEVER inline the registry into pages.** If imports break, fix the alias/path.

**Access:**
\`\`\`javascript
import { FEATURES, FEATURE_AREAS } from '../components/config/features';
\`\`\`

## Vault Access
**Route:** /vault
**Purpose:** Directory of all 40+ platform features

Imports from centralized registry and displays with search/filter.

## Content Protection Policy
**Storage:** ContentProtectionPolicy entity (school_id scoped)

**Default Policy:**
- protect_content: true
- require_payment_for_materials: true
- allow_previews: true
- max_preview_seconds: 90
- max_preview_chars: 1500
- watermark_enabled: true
- copy_mode: "ADDON"
- download_mode: "ADDON"

**Admin:** School Admin → Protection tab

## Multi-Tenant Safety
**Active School:** localStorage.getItem('active_school_id')
**Session:** Use useSession() hook
**Scoped Queries:** components/api/scoped.js helpers

## Terminology
**Config:** School Admin → Terms tab
**Presets:** Breslov, Yeshiva, Generic
**Access:** useTerminology(school) hook

## Diagnostics
**Route:** /integrity (admin-only, vault-only)

## Common Issues

### Import Errors
✅ DO: Fix Vite alias or path
❌ DON'T: Inline registry into pages

### Content Leakage
Check these pages enforce useLessonAccess:
- LessonViewerPremium
- Reader
- Downloads

### Cross-School Leaks
Verify queries use scoped helpers with activeSchoolId
`;

export const ARCHITECTURE = `
# System Architecture

## Overview
Multi-tenant educational platform (Teachable/Kajabi style) with premium LMS features, white-label storefronts, and configurable content protection.

## Core Invariants

1. **Feature Preservation:** 40+ features maintained, accessible via Vault
2. **Multi-Tenancy:** School isolation via school_id filtering
3. **Session Management:** SessionProvider + useSession() hook
4. **Content Protection:** Policy-based with FULL/PREVIEW/LOCKED access levels
5. **Terminology:** Rav/Rabbi + talmid/bachur configurable per school

## Data Flow

### Public Storefront
Guest → School Landing → Catalog → Sales Page → Checkout → Purchase → Entitlements

### Authenticated Learning
User → Dashboard → Courses → Course Detail → Lesson Viewer (access gating) → Content

### Content Access Decision
useLessonAccess → Check entitlements → FULL/PREVIEW/LOCKED

### Multi-Tenant Query
scopedFilter(entity, activeSchoolId, filters) → base44.entities[entity].filter({ school_id, ...filters })

## Key Components

### Navigation
- Feature Registry: components/config/features.js
- Layout: Registry-driven nav
- Vault: All features directory
- Command Palette: Quick navigation

### Security
- ProtectedContent: Blocks copy/print/download
- AccessGate: Paywall component
- useLessonAccess: Access level determination
- Scoped queries: Multi-tenant isolation

### Monetization
- OfferCard: Pricing display
- Checkout: Multi-step purchase flow
- Transaction Approval: Admin dashboard
- Affiliate Tracking: Referral system

## Entity Relationships
School → Membership → User
School → Course → Lesson
School → Offer → Transaction → Entitlement
School → Affiliate → Referral
`;