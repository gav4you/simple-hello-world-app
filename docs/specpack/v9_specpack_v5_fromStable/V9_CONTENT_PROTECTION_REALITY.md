# Content Protection & Access Control (Reality + Hard Rules)
Prepared: January 01, 2026 (Asia/Jerusalem)

## Access levels used in code
Source of truth:
- `src/components/hooks/useLessonAccess.jsx`

Access levels:
- `FULL` — user has active entitlement for course (or ALL_COURSES)
- `PREVIEW` — no entitlement but previews allowed by policy
- `LOCKED` — no access; no preview
- `DRIP_LOCKED` — user has entitlement but lesson not yet available via drip schedule

## Content protection policy
Entity:
- `ContentProtectionPolicy` (school-scoped)

Fetched by:
- `useLessonAccess()` queryKey `['protection-policy', schoolId]`
Default policy lives in hook.

## “No leakage” rule
If accessLevel is `LOCKED` or `DRIP_LOCKED`:
- Do NOT fetch premium materials.
- Do NOT fetch quiz questions (see invariants).

Enforcement helpers:
- `src/components/materials/materialsEngine.jsx`
  - `shouldFetchMaterials(accessLevel)` must gate any material retrieval
- `src/components/security/AccessGate.jsx`
  - Unified lock UI for LOCKED/DRIP_LOCKED

## Secure downloads
- `getSecureDownloadUrl()` in `materialsEngine.jsx`
- Must return URL only when:
  - school policy allows it
  - entitlement/license allows it
  - event is logged (best-effort)

## Preview mode requirements
- Preview must be limited by policy:
  - time: `max_preview_seconds`
  - text: `max_preview_chars`
- Watermarking must include user identity (email) when protected.

## Tech debt to eliminate (in order)
1) Any direct “access_tier” checks in pages → replace with entitlement-based access
2) Any material fetch calls that don’t use `shouldFetchMaterials`
3) Any components that render full content in PREVIEW without trimming
