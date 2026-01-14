# Security Contract & Critical Invariants
**Last Updated:** v8.5 (2025-12-28)

## ABSOLUTE RULES (MUST NEVER BE VIOLATED)

### 1. Multi-Tenant Isolation
- **NEVER** query school-scoped entities without school_id filter
- **ALWAYS** use scopedList, scopedFilter, scopedCreate helpers
- **NEVER** expose cross-school data in UI, queries, or caches
- localStorage keys MUST include schoolSlug or school_id for tenant safety

### 2. Content Protection (Data-Level)
- **NEVER** fetch lesson materials when accessLevel is LOCKED or DRIP_LOCKED
- **NEVER** render download file_url in DOM for unauthorized users
- **NEVER** search lesson.content or text bodies for unentitled users
- **ALWAYS** use materialsEngine.shouldFetchMaterials() before queries
- **ALWAYS** use materialsEngine.sanitizeMaterialForAccess() before rendering

### 3. Access State Machine
**States:** FULL | PREVIEW | LOCKED | DRIP_LOCKED

- **FULL:** Active entitlement + no drip restriction → full materials (still wrapped in ProtectedContent)
- **PREVIEW:** No entitlement + preview allowed → truncated materials (maxPreviewChars, maxPreviewSeconds)
- **LOCKED:** No entitlement + no preview → AccessGate paywall, NO material fetch
- **DRIP_LOCKED:** Has entitlement but lesson unreleased → AccessGate drip countdown, NO material fetch

**Transitions:**
- LOCKED → PREVIEW (if is_preview=true)
- LOCKED → FULL (on entitlement grant)
- FULL → DRIP_LOCKED (if lesson has drip settings and not yet released)
- DRIP_LOCKED → FULL (on release date/time)

### 4. Entitlement Expiry
- **ALWAYS** validate entitlement expiry with isEntitlementActive(ent, now)
- **NEVER** grant access based on expired entitlements
- Subscription reconciliation MUST run on session load

### 5. Drip Scheduling
- **Enrollment date** = earliest entitlement.created_date for course
- **Drip rules:** drip_publish_at (explicit) OR drip_days_after_enroll + enrollment date
- **Enforcement:** DRIP_LOCKED state prevents ALL content access (video, text, downloads, AI tutor)

### 6. Copy/Download Licensing
- Copy/Download licenses are SEPARATE from course access
- Require BOTH: (a) active course entitlement AND (b) active license entitlement
- Policy modes: DISALLOW | INCLUDED_WITH_ACCESS | ADDON
- Enforcement: ProtectedContent wrapper + materialsEngine gating

### 7. Idempotency Keys
- **Entitlement:** (school_id, user_email, type, course_id?, source_id)
- **Referral:** (school_id, transaction_id)
- **CouponRedemption:** (school_id, transaction_id)
- **PayoutBatch:** only unbatched commissions (payout_batch_id=null)
- **Certificate:** (school_id, user_email, course_id)
- **ALWAYS** check existing before create; return existing if found

### 8. Search Security
- **METADATA ONLY:** Search titles, descriptions, tags, metadata
- **NEVER** include content, body, transcript_text in search filters
- **ALWAYS** apply limits (100 max) to prevent performance issues
- SchoolSearch MUST NOT leak unentitled lesson content

### 9. RBAC Enforcement
- **School Admin pages:** SchoolAdmin, SchoolMonetization, SchoolStaff, AuditLogViewer
  - MUST check isSchoolAdmin(membership.role)
- **Global Admin pages:** NetworkAdmin
  - MUST check isGlobalAdmin(user.email)
- **Teacher pages:** Teach, TeachCourse, TeachLesson
  - MUST check isTeacher(membership.role)
- Redirect or show access denied if unauthorized

### 10. Attribution Persistence
- **Capture:** Landing page URL params (ref, utm_*)
- **Storage:** localStorage per schoolSlug, 14-day expiry
- **Attach:** transaction.metadata.attribution
- **Clear:** On purchase completion (prevent reuse)
- **Multi-tenant:** Storage keys scoped by schoolSlug

### 11. Audit Logging (Best Effort)
- **Log all sensitive operations:** Staff invites, role changes, entitlement grants, payouts
- **Include:** school_id, user_email, action, entity_type, entity_id, metadata
- **Never crash** if logging fails (try/catch + best effort)

### 12. Download Security
- **NEVER** expose file_url in HTML/DOM for unauthorized users
- **ALWAYS** use getSecureDownloadUrl() before revealing URL
- **LOG** all download attempts (granted + blocked)
- Fallback: client-side authorization check before click

## Critical Files (DO NOT MODIFY WITHOUT SECURITY REVIEW)

### Tier 1 (FREEZE AFTER v8.5 VERIFICATION):
- components/api/scoped.js
- components/hooks/useLessonAccess.js
- components/security/AccessGate.jsx
- components/protection/ProtectedContent.jsx
- components/utils/entitlements.jsx
- components/auth/roles.js
- components/materials/materialsEngine.js

### Tier 2 (HIGH RISK):
- pages/LessonViewer.js
- pages/LessonViewerPremium.js
- pages/Reader.js
- pages/Downloads.jsx
- pages/SchoolSearch.jsx
- pages/SchoolCheckout.jsx
- pages/SchoolMonetization.jsx

### Tier 3 (MODERATE RISK):
- components/drip/dripEngine.js
- components/certificates/certificatesEngine.js
- components/analytics/track.js
- components/analytics/attribution.js
- components/subscriptions/subscriptionEngine.js

## Regression Detection Checklist

Before deploying changes, verify:
- [ ] No school-scoped queries missing school_id
- [ ] No content/body fields in search filters
- [ ] No file_url rendering for unauthorized users
- [ ] No material fetches in LOCKED/DRIP_LOCKED states
- [ ] All entitlement checks include expiry validation
- [ ] All admin pages have role gates
- [ ] All list queries have limits
- [ ] Idempotency preserved for all monetization ops
- [ ] /integrity passes all checks

## Recovery Procedure

If data leakage or unauthorized access detected:
1. Run /integrity diagnostic immediately
2. Check AuditLog for recent operations
3. Verify scoped.js entity list is complete
4. Verify useLessonAccess returns correct accessLevel
5. Verify Downloads.jsx uses secure retrieval
6. Verify Search is metadata-only
7. Review AuditLog for suspicious access patterns
8. If duplicate entitlements/commissions found, identify root cause and add idempotency check

## Testing Protocol

### Access Control Tests:
1. Guest → LessonViewer (expect: LOCKED gate, no content)
2. Guest → Downloads (expect: license required, no URLs)
3. Guest → Search (expect: metadata results only)
4. Paid user → DRIP_LOCKED lesson (expect: countdown, no content)
5. Preview mode → LessonViewer (expect: truncated content only)

### Idempotency Tests:
1. Approve same transaction twice (expect: no duplicate entitlements)
2. Process same referral twice (expect: skip duplicate)
3. Redeem same coupon twice (expect: skip duplicate)
4. Create payout batch twice same range (expect: no re-batching)

### RBAC Tests:
1. Student → SchoolAdmin (expect: access denied)
2. Student → NetworkAdmin (expect: access denied)
3. Non-global admin → NetworkAdmin (expect: access denied)
4. Teacher → SchoolStaff (expect: access denied if not admin)

## End of Security Contract