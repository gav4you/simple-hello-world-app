# CHANGELOG

All notable changes to Breslov Academy platform.
This is an append-only file - never delete previous entries.

---

## v7.3 (Lockdown: Docs + Routing + Registry Integrity) - 2025-12-28
- Documentation system established (embedded in components/utils/)
- Router + registry alignment validated by /integrity  
- Canonical storefront routes confirmed (/s/:schoolSlug/*) with legacy aliases preserved
- Data leakage safeguards hardened
- Comprehensive audit infrastructure
- useStorefrontContext hook for unified param/query resolution

## v8.2 (Teachable/Kajabi Upgrade) - 2025-12-28
- Enhanced bundles + subscriptions support
- Improved affiliate payouts with batching
- Admin analytics funnel + revenue dashboards  
- School-scoped pricing with bundle grouping
- Subscription management and tracking
- Upsell optimization on thank-you page
- Created Bundle, SubscriptionPlan, CouponRedemption, PayoutBatch, AnalyticsEvent entities
- Referral commission processing on transaction approval
- Download audit logging
- SchoolPricing page with tiered offers (subscriptions, bundles, courses, add-ons)
- Feature registry expanded to cover all 40+ pages

## v8.6 (Premium UX + Performance) - 2025-12-30
- Introduced design tokens and premium UI primitives (PageShell, GlassCard, SectionHeader, EmptyState, StatusBadge, IconButton, Stepper)
- Standardized page state, toast, modal, and drawer adapters
- Lazy-loaded heavy routes with Suspense fallbacks for faster initial load
- Query hardening: debounced search, strict limits, and pagination patterns across high-traffic pages
- Command Palette accessibility and quick actions improved (aria-labels, keyboard-first)
- Lint/build health: normalized docs to plain markdown and cleaned up unused imports / hook ordering

## v8.7 (Integrity Scans + Virtualization + Reader Fetch Hardening) - 2025-12-30
- /integrity upgraded with best-effort source scans to detect common regression patterns (search leakage, download URL exposure, scoped entity list drift)
- Added dependency-free VirtualizedList for large admin lists (chunked render + content-visibility)
- NetworkAdmin and SchoolMonetization list rendering optimized to prevent main-thread stalls
- Reader: Text retrieval now entitlement-gated at query-time (avoids fetching protected texts for unentitled users)

## v8.8 (Runtime Tenancy Guard) - 2025-12-30
- Added tenancy runtime context + installer that patches base44 entity methods at runtime
  to auto-inject school_id for school-scoped entities (defense-in-depth against accidental unscoped queries)
- Added explicit global-admin escape hatches for legitimate cross-school operations (.filterGlobal/.listGlobal)
- Updated NetworkAdmin to use global escape hatches to preserve cross-school reporting
- Added /integrity check to confirm tenancy enforcer is installed

---

## Previous Versions

### v8.1 (Enhanced Monetization)
- Affiliate referral tracking in transactions
- Commission calculation and payout system
- Upsell CTAs on thank-you page
- Enhanced checkout with coupon validation

### v8 (Storefront + Monetization Expansion)
- White-label storefront (bundles, subscriptions, upsells)
- Coupons + affiliate/referral tracking
- Admin analytics and payouts dashboards
- Manual payment approval workflow

### v7.2 (Security Hotfixes)
- OAuth CLIENT_SECRET removed from frontend
- LessonViewer.js protected (was unprotected)
- Reader.js React Hook violation fixed
- Scoped queries added to all fetches
- ProtectedContent uses canCopy/canDownload
- Entitlement field normalization
- Guest checkout enabled

### v7.1 (Registry Consolidation + Routing + Security)
- Feature registry consolidated to single source
- Vault link generation fixed
- Canonical storefront routes added
- OAuth hardened
- Scoped API corrected
- Lesson viewers + Reader + Downloads + Search protected
- /integrity diagnostics added

### v7 (Foundation)
- Content protection policy system
- useLessonAccess (FULL/PREVIEW/LOCKED)
- Admin protection + terminology settings
- Vault directory
- Multi-tenant scoping

---

Last Updated: 2025-12-30

### v8.9 (Contracts + Automated Safety Scans)
- Added query contracts (normalizeLimit) to prevent unbounded reads by default
- TenancyEnforcer now records runtime warnings (blocked/coerced queries) for diagnostics
- /integrity displays and can clear runtime tenancy warnings
- Added static regex-based code scanner to flag leakage/list/file_url regressions