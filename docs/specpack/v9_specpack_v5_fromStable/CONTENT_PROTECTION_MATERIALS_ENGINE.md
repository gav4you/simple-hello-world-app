# Content Protection + Materials Engine Spec — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

This is the heart of the platform. It must never leak protected material.

---

## 1) Threat model (what must never happen)
- Guest sees full lesson text/transcripts.
- Locked user receives direct file URLs.
- DRIP_LOCKED user fetches materials early “in the background.”
- Search indexes full text and exposes it to unauthorized users.
- A component mounts material payload even briefly before gate renders.

---

## 2) Access state machine
Inputs:
- user session + membership
- entitlement(s) (active, unexpired)
- drip schedule (release logic)
- admin policy (preview limits, watermark, copy/download licensing)
- lesson/courses flags

Outputs:
- `LOCKED` (no entitlement)
- `DRIP_LOCKED` (entitled but unreleased)
- `UNLOCKED` (entitled + released)

---

## 3) Hard enforcement rules
- In `LOCKED` or `DRIP_LOCKED`, the UI must render **AccessGate only**.
- Do not call materials fetch functions.
- Do not render child viewer components that expect material.
- Do not pass placeholder material objects downstream.

---

## 4) Materials Engine API
Suggested functions:
- `getLessonAccess({lessonId, userId, tenantId}) -> { state, unlockAt, reasons, previewAllowed }`
- `getLessonMaterials({lessonId, userId, tenantId}) -> materials` (must assert UNLOCKED)
- `getDownloadUrl({fileId, userId, tenantId}) -> signedOrEphemeralUrl` (must log)

Implementation patterns:
- One hook: `useLessonAccess(lessonId)` returns state and UI gating.
- Viewer mounts only when `state === 'UNLOCKED'`.

---

## 5) Preview policy
Admin-configurable:
- preview minutes for video
- preview paragraphs for text
- watermark configuration
- copy/print/right-click blocking toggles (UI layer + logging)
- “copy/download license” add-ons

---

## 6) Search leakage prevention
Search results:
- metadata only: title, tags, snippet from allowed preview
- never query full transcripts or full text for unauthorized users
- log suspicious repeated search requests
