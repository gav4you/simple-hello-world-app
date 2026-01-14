# QA, Healthchecks, Releases (Reality + Future)
Prepared: January 01, 2026 (Asia/Jerusalem)

## Existing healthchecks
From repo root `HEALTHCHECKS.md`:
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


## Existing release tooling (Windows PowerShell)
- `scripts/release.ps1`
  - stages repo files
  - writes checksums
  - writes BUILDINFO
  - zips output
- `scripts/update-gitlab-from-zip.ps1`
  - clones repo
  - expands zip
  - robocopy /MIR into repo (excluding .git/node_modules/dist/build/coverage)
  - pushes branch

## Future CI plan (GitLab CI/CD)
- PR: lint, typecheck, build
- Optional: small test suite for invariants
- Tag: attach zipped artifact + checksums to GitLab Release
