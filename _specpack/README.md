# Breslov Academy LMS — v9.0 Spec Pack (Text Docs)
Prepared: January 01, 2026 (Asia/Jerusalem)

This folder is the **single source of truth** to continue coding in a fresh chat **using the v9.0 zip**.

## Non‑negotiables
- **No features removed.** Everything that exists stays; reorganize + upgrade only.
- **No destructive refactors.** Keep legacy routes working via aliases/adapters.
- **Vault always.** Every feature must remain discoverable via Vault + Feature Registry.
- **Tenant scoping everywhere.** All school-owned data must be scoped by `activeSchoolId` (private portals) or `schoolSlug -> school_id` (public storefront).
- **Content safety:** In `LOCKED` or `DRIP_LOCKED` states, lesson materials **must not fetch, render, mount, or be passed** into downstream components (including AI tutor).

## What you do first when you upload the v9.0 zip
1. **Unzip locally** and run the project once to confirm it builds.
2. Run the **Phase 0 Audit** in `ROADMAP_V9_DETAILED.md` to discover:
   - router entry file(s)
   - layout/nav shell
   - Vault page
   - session/auth provider
   - tenancy helper(s)
   - where entities live (`entities/*.json` in Base44-style projects)
3. Populate/verify the Feature Registry from real routes (never guess).

## Files in this pack
- `ROADMAP_V9_DETAILED.md` — extremely detailed, step-by-step roadmap and backlog.
- `ARCHITECTURE_NORTH_STAR.md` — target architecture (session, tenancy, gating, registry).
- `IA_ROUTES_PORTALS.md` — complete route map (public + portals + storefront + legacy).
- `RBAC_TENANCY_MODEL.md` — roles/permissions matrix + tenant-scoping rules.
- `DESIGN_SYSTEM_UI_UX.md` — tokens, components, patterns (WOW + calm + academic).
- `FEATURE_REGISTRY_AND_VAULT.md` — registry schema + nav + Vault + command palette.
- `CONTENT_PROTECTION_MATERIALS_ENGINE.md` — gating states + materials engine contracts.
- `STORE_MONEY_SUBSCRIPTIONS.md` — storefront, offers, coupons, affiliates, payouts.
- `OPS_INTEGRITY_QA.md` — integrity contract, diagnostics, regression net, release checks.
- `MIGRATIONS_DATA_MODEL.md` — conceptual data model + “extend-not-replace” migrations.
- `NEXT_CHAT_CONTEXT.md` — copy/paste into a new ChatGPT coding chat.

## Output discipline during coding
Every major step ends with:
- What changed
- Where it changed (file paths)
- How to run/test
- What’s next

---

## Repo reality integration (required before heavy coding)
Because GitLab repos can be private, Phase 0 Audit must use `REPO_REALITY_AUDIT.md` to extract:
- actual router file paths
- actual entity storage (Base44 JSONs etc.)
- actual auth/session provider
- actual storefront + monetization modules


---

## GitLab repository (Breslov Academy)
Remote:
- HTTPS: `https://gitlab.com/yeshivabachur/breslov-academy.git`
- SSH: `git@gitlab.com:yeshivabachur/breslov-academy.git`

Clone:
- Git (HTTPS): `git clone https://gitlab.com/yeshivabachur/breslov-academy.git`
- Git (SSH): `git clone git@gitlab.com:yeshivabachur/breslov-academy.git`
- GitLab CLI: `gh repo clone yeshivabachur/breslov-academy`
