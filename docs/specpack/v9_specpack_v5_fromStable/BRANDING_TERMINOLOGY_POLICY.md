# Branding, Terminology, and Policy Settings — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

These settings must be tenant-scoped and admin-editable.

---

## 1) Branding settings (per tenant)
- Name + short name
- Logo and favicon
- Accent color (mapped into design tokens)
- Optional domain/custom URL (if supported)
- Storefront hero copy + tagline

Where it should live:
- Admin portal: `/admin/settings` -> Branding tab

---

## 2) Terminology settings (per tenant)
Goal: UI labels should adapt to each school.
Examples:
- Teacher: Rabbi / Rav / Instructor
- Student: talmid / bachur / learner
- Course: shiur / course
- Lesson: lesson / shiur

Where it should live:
- Admin portal: `/admin/settings` -> Terms tab

Rule:
- If terminology system already exists, **use it** (do not replace).
- If missing, implement minimally with safe fallbacks.

---

## 3) Content protection policy (per tenant)
Configurable:
- Preview limits (video minutes, text paragraphs)
- Watermark
- Copy/print blocking (UI layer)
- Download/copy license add-ons

Where it should live:
- Admin portal: `/admin/settings` -> Protection tab

---

## 4) Monetization settings (per tenant)
- Offers, coupons, bundles, subscriptions
- Payout settings
- Affiliate settings

Where it should live:
- Admin portal: `/admin/monetization`
