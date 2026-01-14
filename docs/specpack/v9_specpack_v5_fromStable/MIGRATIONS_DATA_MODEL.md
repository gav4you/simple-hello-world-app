# Data Model + Migrations (Extend-not-replace) — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

This is conceptual; align to existing Base44 entity JSONs and safely migrate.

---

## 1) Entities (minimum)
Tenant + auth:
- `School` / `Tenant`
- `User`
- `Membership`
- `Invitation`
- `OrgApplication` / `TenantApplication`

Learning:
- `Course`, `Lesson`
- `Enrollment`
- `Progress`
- `Assignment`, `Submission`, `Grade`
- `MessageThread`, `Message`

Content protection:
- `LessonMaterial` (if present) or equivalent material store
- `ProtectionPolicy` (per tenant)
- `DownloadAttempt` / `BlockedAttempt` logs

Storefront:
- `Offer`, `Bundle`
- `Purchase`, `Transaction`
- `Entitlement`
- `Coupon`, `CouponRedemption`
- `SubscriptionPlan`, `Subscription`, `SubscriptionInvoice`
- `Affiliate`, `ReferralClick`, `Commission`
- `PayoutBatch`, `PayoutRecord`

Ops:
- `AuditLog`
- `AnalyticsEvent`

---

## 2) Migration rules
- Never delete fields in a “stable” pass.
- Prefer additive changes: new fields with defaults.
- Write backfill tools:
  - `MigrationTools` page: runs safe backfills, previews changes, emits audit logs.

---

## 3) Tenant scoping additions
For any entity missing `school_id`, add it (non-destructively), then backfill from related entities.

---

## 4) Idempotency keys
Add idempotency fields where needed:
- `Purchase.payment_intent_id` (unique)
- `Entitlement.source_purchase_id` + composite uniqueness
- `Commission.purchase_id` unique
- `PayoutRecord.commission_id` unique
