# Storefront + Monetization (Teachable/Kajabi mode) — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

This describes the storefront experience while keeping multi-tenant security intact.

---

## 1) Storefront surfaces (per school slug)
- School landing: `/s/:schoolSlug`
- Catalog: `/s/:schoolSlug/catalog`
- Sales page: `/s/:schoolSlug/course/:courseId`
- Pricing/offers: `/s/:schoolSlug/pricing`
- Checkout: `/s/:schoolSlug/checkout`
- Thank you: `/s/:schoolSlug/thank-you`

All storefront data must be scoped using `schoolSlug -> school_id`.

---

## 2) Offer model
Offer types:
- Single course
- Bundle
- Subscription plan/tier
- Add-ons:
  - Copy license
  - Download license

Offer fields:
- price, currency, active
- included content references
- limits (seat count, expiry)
- upsells/order bumps
- coupon eligibility rules

---

## 3) Checkout flow (idempotent)
1) Guest enters email (or logged-in uses account)
2) Cart/offer summary
3) Coupon application
4) Payment
5) Create purchase record
6) Grant entitlements (idempotent)
7) Track analytics event
8) Redirect to thank-you

Idempotency safeguards:
- payment intent id / transaction id unique constraint
- entitlement grants dedupe
- affiliate commission dedupe
- payout batch dedupe

---

## 4) Entitlements as source of truth
Rules:
- Any access checks consult entitlements.
- Expired entitlements are ignored everywhere.
- Entitlements must be tenant-scoped.

---

## 5) Affiliates
Per-tenant affiliates:
- referral code or link
- click tracking
- conversion tracking
- earnings ledger
- payout batches + export + mark-paid workflow

---

## 6) Analytics instrumentation
Track:
- page views on storefront
- checkout start
- coupon applied
- purchase completed
- upsell accepted/rejected
- churn/renewal events for subscriptions (best-effort)

---

## 7) Admin dashboards
School admin:
- offers/coupons/transactions approvals
- payouts batching
- affiliate performance
- conversion funnel
