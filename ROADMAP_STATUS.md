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
