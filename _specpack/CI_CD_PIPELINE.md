# CI/CD Plan (GitLab CI/CD) — v9+
Prepared: January 01, 2026 (Asia/Jerusalem)

## CI on pull requests
Recommended jobs:
1) Install (cache deps)
2) Lint
3) Typecheck (if TS)
4) Unit tests (gating + access state + idempotency)
5) Build (production)
6) Dependency audit (best-effort)
7) Upload artifact (optional)

## CD on tags
- Tag stable releases: `v9.0.0`, `v9.0.1`, `v9.1.0`
- Generate release notes from CHANGELOG
- Optional: attach build artifact to GitLab Release

## Merge gates
- CI must be green
- QA ship gate must be green for stable tags
- Integrity report sample stored under `docs/integrity-samples/` (for stable)
