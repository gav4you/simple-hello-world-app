# Known Issues / Tech Debt (Seed List)
Prepared: January 01, 2026 (Asia/Jerusalem)

This list starts from the v9.0 stable ZIP inspection.

## Registry gaps
- [ ] `TeachQuizEditor` page exists but is missing from `FEATURES` registry.
- [ ] `QuizTake` page exists but is missing from `FEATURES` registry.

## Portal split not implemented yet
- [ ] No `/student/*`, `/teacher/*`, `/admin/*` route groups yet.
- [ ] No `/login/student` and `/login/teacher` pages yet.

## Public marketing site not implemented yet
- [ ] No `/about`, `/how-it-works`, `/faq`, `/contact`, `/privacy`, `/terms` pages.

## Security follow-ups
- [ ] Audit for any direct calls to `base44.entities.<scoped>.create/update/delete`
- [ ] Audit lesson viewer + quizzes for any fetch while LOCKED/DRIP_LOCKED

## Documentation
- [ ] Ensure docs live under `/docs` in the real repo and are kept current
