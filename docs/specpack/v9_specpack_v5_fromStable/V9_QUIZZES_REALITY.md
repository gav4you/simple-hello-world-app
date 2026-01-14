# Quizzes (v9.0 Reality + Future Extensions)
Prepared: January 01, 2026 (Asia/Jerusalem)

## Canonical quiz routes (already implemented in router)
Defined in `src/App.jsx`:
- `/my-quizzes` → `Pages.MyQuizzes`
- `/quiz/:quizId` → `Pages.QuizTake`
- `/teach/quizzes` → `Pages.TeachQuizzes`
- `/teach/quizzes/new` → `Pages.TeachQuizEditor`
- `/teach/quizzes/:quizId` → `Pages.TeachQuizEditor`

## Storage model (from scoped entities list)
School-scoped entities include:
- `Quiz` (meta)
- `QuizQuestion` (questions)
- `QuizAttempt` (attempts)

Confirm in backend + usage:
- search in code for `base44.entities.Quiz`, `QuizQuestion`, `QuizAttempt`
- enforce scoping via `scoped*`

## Security invariant
From `SECURITY_INVARIANTS.md`:
- If questions are stored in `QuizQuestion`, do **not** fetch them when access is LOCKED.

## v9.1+ extensions (planned)
- Question bank / reusable items
- Randomization by difficulty
- Anti-cheating: time windows, per-lesson gating, watermarking
- Analytics: item discrimination, mastery tracking
