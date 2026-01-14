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

Last Updated: 2025-12-28