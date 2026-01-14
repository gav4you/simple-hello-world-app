# V9.0 Stable — Codebase Reality Map
Prepared: January 01, 2026 (Asia/Jerusalem)

This document is generated from the uploaded ZIP: `breslov-academy_v9.0-stable.zip`.

## Repo identity
- App: `base44-app` `9.0.0`
- BUILDINFO: `v9.0-stable` created `2026-01-01T00:50:23Z`
- Source zip in BUILDINFO: `breslov-academy-main00_v89.zip`

GitLab:
- HTTPS: `https://gitlab.com/yeshivabachur/breslov-academy.git`
- SSH: `git@gitlab.com:yeshivabachur/breslov-academy.git`
- GH CLI: `gh repo clone yeshivabachur/breslov-academy`

---

## Stack (confirmed)
- Vite + React (`vite.config.js`, `src/main.jsx`)
- React Router DOM (`src/App.jsx`)
- Tailwind + shadcn/ui + Radix
- TanStack Query (`@tanstack/react-query`)
- Base44 SDK (`@base44/sdk`) with runtime tenancy enforcement

Scripts:
- `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm run preview`
- Release packaging: `scripts/release.ps1`
- Update repo from ZIP: `scripts/update-gitlab-from-zip.ps1`

---

## Key files (where the “truth” lives)
- **App entry**: `src/main.jsx`
- **Router**: `src/App.jsx`
- **Global layout/nav**: `src/Layout.jsx`
- **Pages registry**: `src/pages.config.js`
- **Feature registry (nav + vault)**: `src/components/config/features.jsx`
- **Route helper**: `src/utils/index.ts`
- **Auth context**: `src/lib/AuthContext.jsx`
- **Session context (audience/role/tenant)**: `src/components/hooks/useSession.jsx`
- **Tenancy bridge**: `src/components/api/TenancyBridge.jsx`
- **Scoped CRUD helpers**: `src/components/api/scoped.jsx`
- **Scoped entities list**: `src/components/api/scopedEntities.js`
- **Tenancy runtime enforcer install**: `src/api/base44Client.js`
- **Lesson access hook**: `src/components/hooks/useLessonAccess.jsx`
- **Materials engine**: `src/components/materials/materialsEngine.jsx`
- **Access gate UI**: `src/components/security/AccessGate.jsx`
- **Vault**: `src/pages/Vault.jsx`
- **Integrity**: `src/pages/Integrity.jsx`
- **Storefront landing**: `src/pages/SchoolLanding.jsx`
- **Release script**: `scripts/release.ps1`
- **Update GitLab from ZIP**: `scripts/update-gitlab-from-zip.ps1`

---

## High-level source tree (first 120 entries, depth≤3)
- `App.jsx`
- `Layout.jsx`
- `api/`
- `api/base44Client.js`
- `components/`
- `components/UserNotRegisteredError.jsx`
- `components/academic/`
- `components/academic/quizEngine.jsx`
- `components/accessibility/`
- `components/accessibility/AccessibilityMenu.jsx`
- `components/admin/`
- `components/admin/ContentProtectionSettings.jsx`
- `components/ai/`
- `components/ai/AITutor.jsx`
- `components/ai/AcademicAdvisorChat.jsx`
- `components/ai/AiTutorPanel.jsx`
- `components/ai/CourseRecommendations.jsx`
- `components/analytics/`
- `components/analytics/ConversionFunnel.jsx`
- `components/analytics/EngagementPredictor.jsx`
- `components/analytics/LearningStyleAssessment.jsx`
- `components/analytics/RevenueChart.jsx`
- `components/analytics/StudentDashboard.jsx`
- `components/analytics/attribution.jsx`
- `components/analytics/track.jsx`
- `components/announcements/`
- `components/announcements/AnnouncementsPanel.jsx`
- `components/api/`
- `components/api/TenancyBridge.jsx`
- `components/api/contracts.js`
- `components/api/scoped.jsx`
- `components/api/scopedEntities.js`
- `components/api/tenancyEnforcer.js`
- `components/api/tenancyRuntime.js`
- `components/api/tenancyWarnings.js`
- `components/auth/`
- `components/auth/roles.jsx`
- `components/automation/`
- `components/automation/AutomationBuilder.jsx`
- `components/career/`
- `components/career/ResumeBuilder.jsx`
- `components/career/SalaryNegotiator.jsx`
- `components/certificates/`
- `components/certificates/CertificateView.jsx`
- `components/certificates/certificatesEngine.jsx`
- `components/collaboration/`
- `components/collaboration/Whiteboard.jsx`
- `components/community/`
- `components/community/ReportButton.jsx`
- `components/config/`
- `components/config/features.jsx`
- `components/courses/`
- `components/courses/CourseCard.jsx`
- `components/creator/`
- `components/creator/BulkOperations.jsx`
- `components/dashboard/`
- `components/dashboard/StatCard.jsx`
- `components/drip/`
- `components/drip/dripEngine.jsx`
- `components/enterprise/`
- `components/enterprise/TeamDashboard.jsx`
- `components/focus/`
- `components/focus/PomodoroTimer.jsx`
- `components/gamification/`
- `components/gamification/AchievementBadge.jsx`
- `components/gamification/PowerUpShop.jsx`
- `components/hooks/`
- `components/hooks/useLessonAccess.jsx`
- `components/hooks/useSession.jsx`
- `components/hooks/useStorefrontContext.jsx`
- `components/hooks/useTerminology.jsx`
- `components/insights/`
- `components/insights/LearningInsights.jsx`
- `components/instructor/`
- `components/instructor/CourseBuilder.jsx`
- `components/instructor/InstructorDashboard.jsx`
- `components/instructor/TeachCourseCurriculum.jsx`
- `components/instructor/TeachCoursePricing.jsx`
- `components/instructor/TeachCourseSettings.jsx`
- `components/instructor/TeachCourseStudents.jsx`
- `components/integrations/`
- `components/integrations/GoogleServiceConnector.jsx`
- `components/language/`
- `components/language/FlashcardPractice.jsx`
- `components/language/LanguageSelector.jsx`
- `components/learning/`
- `components/learning/BookmarkPanel.jsx`
- `components/learning/CodePlayground.jsx`
- `components/learning/DiscussionThread.jsx`
- `components/learning/NotesPanel.jsx`
- `components/learning/PremiumVideoPlayer.jsx`
- `components/learning/QuizCard.jsx`
- `components/learning/TranscriptPanel.jsx`
- `components/marketing/`
- `components/marketing/CourseLandingPage.jsx`
- `components/materials/`
- `components/materials/materialsEngine.jsx`
- `components/mobile/`
- `components/mobile/OfflineMode.jsx`
- `components/moderation/`
- `components/moderation/ContentReportForm.jsx`
- `components/monetization/`
- `components/monetization/OfferCard.jsx`
- `components/navigation/`
- `components/navigation/CommandPalette.jsx`
- `components/notifications/`
- `components/notifications/NotificationCenter.jsx`
- `components/onboarding/`
- `components/onboarding/OnboardingFlow.jsx`
- `components/parent/`
- `components/parent/StudentProgressReport.jsx`
- `components/payouts/`
- `components/payouts/PayoutBatchManager.jsx`
- `components/proctoring/`
- `components/proctoring/ProctorView.jsx`
- `components/protection/`
- `components/protection/ProtectedContent.jsx`
- `components/scheduling/`
- `components/scheduling/StudyCalendar.jsx`
- `components/school/`

> Note: this is intentionally shallow. When coding, we use targeted search (`rg`) rather than browsing.

---

## Existing invariants docs (already in repo)
These are **already present** in the codebase and must remain true:

### SECURITY_INVARIANTS.md
# Security Invariants

These are **non-negotiable** rules enforced by architecture.

## Tenancy
- Any entity listed in `src/components/api/scopedEntities.js` is **school-scoped**.
- All creates/updates/deletes for school-scoped entities must use:
  - `scopedCreate`, `scopedUpdate`, `scopedDelete`
- Direct calls to `base44.entities.<SchoolScopedEntity>.create/update/delete` are forbidden.
- The runtime enforcer will block missing/incorrect `school_id`.

## Access
- Expiring entitlements must be checked with `isEntitlementActive`.
- Lesson access uses `useLessonAccess` (drip + preview + license add-ons).

## Content protection
- Locked users must not receive full premium lesson content.
- Preview content must be strictly limited by policy.
- Watermarks must include user identity (email) when protected.

## Quizzes
- If questions are stored in `QuizQuestion`, do **not** fetch them when access is LOCKED.


### ROADMAP_CODEX.md
# Breslov Academy — Roadmap (Codex / Implementation)

This repo follows a strict principle:
- **No features are deleted.** Features may be upgraded, merged, or hidden from main nav, but must stay discoverable in **Vault**.

## P0 — Make it stable
1. **Tenancy invariants**: all school-scoped CRUD uses `scoped*` helpers (never direct `base44.entities.X.create/update/delete`).
2. **Access invariants**: access checks are **expiry-aware** (`isEntitlementActive`) and **drip-aware** (`dripEngine`).
3. **Reader invariants**: locked users must not receive full premium content.
4. **Build invariants**: no Hook rule violations; no CommonJS `require` in ESM.

## P1 — Quizzes (v9.0)
- Teacher can create/edit/publish quizzes.
- Students can take quizzes.
- Attempts recorded.
- **Question fetch gating**: do not fetch questions when access is LOCKED.
- Preferred storage: `Quiz` (meta) + `QuizQuestion` (questions). Fallback to inline questions if entity absent.

## P2 — Monetization + White-label
- Multi-school storefront per school.
- Course access levels + bundles + add-ons.
- Stripe checkout flows.

## P3 — Quality
- Automated healthchecks.
- Release packaging with checksums.
- CI (typecheck, lint, tests).


### ROADMAP_STATUS.md
# Roadmap Status

Date: 2026-01-01

## Done
- v7 foundation: Protected content system (copy/print/download blocking, watermarking, preview limits, license add-ons).
- Tenancy scaffolding: `TenancyBridge`, `tenancyEnforcer`, `scoped*` helpers.
- Feature registry: Vault discoverability for all pages.

## In progress (v9.0)
- Quizzes: canonical routes + teacher editor + student take flow + attempt recording.
- Access hardening: fix `useLessonAccess` hook to be hook-rule compliant and expiry/drip aware.

## Next
- Refactor remaining legacy `access_tier` checks to use entitlement-based access (backwards compatible).
- Add healthcheck scripts + CI.
- Release automation (PowerShell): generate stable ZIP + checksums + GitLab branch update.


### HEALTHCHECKS.md
# Healthchecks

Run these before tagging a stable ZIP.

## Local
1. Install deps
   - `npm ci` (recommended) or `npm install`
2. Build
   - `npm run build`
3. Lint
   - `npm run lint`
4. Dev smoke
   - `npm run dev`
   - Open: Dashboard, Courses, CourseDetail, LessonViewer, Reader, Vault
   - Teacher: Teach → Course Builder → Lesson Editor
   - Quizzes: /teach/quizzes → create quiz → publish → /quiz/:id

## Tenancy smoke
- Create a quiz/attempt only when an active school is set.
- Verify cross-school reads are denied unless explicitly allowed.

## Release artifacts
- Generate a ZIP that excludes `node_modules`, `.git`, `dist`, `coverage`.
- Include checksums and a BUILDINFO record.

