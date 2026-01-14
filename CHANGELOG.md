# Changelog

## 10.0-stable-r3
- Phase 2 tenancy hardening (pass 1): Dashboard, Feed, and MyProgress now use `useSession` and tenant-scoped query helpers.
- Reduced direct `base44.entities.*` usage for school-scoped entities.

## 10.0-stable-r2
- Public marketing home redirects authenticated users to `/app`.
- Login pages store canonical intent keys (`ba_intended_audience`, `ba_portal_prefix`) and removed stray control characters.
- Feature Registry updated with public marketing + legal routes, including `/legal/*` aliases.
- LessonViewerPremium hardened to use `useSession` + tenant-scoped queries.

## 10.0-stable
- Initial stable rebuild.
- Added GitLab CI modular kits under `.gitlab/ci/` (Windows Node pipeline + security basics).
- Fixed `scripts/release.ps1` so `-IncludeDist` actually includes `dist/` in the staged ZIP.
