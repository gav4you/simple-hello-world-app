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
