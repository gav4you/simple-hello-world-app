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
