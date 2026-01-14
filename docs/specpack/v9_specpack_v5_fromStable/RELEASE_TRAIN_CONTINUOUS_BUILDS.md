# Release Train — Continuous Builds (v9.0 → v10)
Prepared: January 01, 2026 (Asia/Jerusalem)

This is the *long-term* plan for “continuous improvement builds” that never stop.
It is written to work with your workflow: **you give me a ZIP; I produce PR-ready code in the next chat**.

---

## Repo & cloning
- HTTPS: https://gitlab.com/yeshivabachur/breslov-academy.git
- SSH: git@gitlab.com:yeshivabachur/breslov-academy.git
- GH CLI: gh repo clone yeshivabachur/breslov-academy

Branching baseline:
- `main` = always deployable (only stable releases)
- `dev`  = optional (if you prefer a single integration branch)
- feature branches per PR (recommended)

Release artifact:
- Build ZIP produced by `scripts/release.ps1`
- Must include: `BUILDINFO.json`, `CHECKSUMS.txt`

---

## Versioning policy (SemVer with “train” meaning)
- `MAJOR` (v10, v11…): architecture milestones (portalization complete, new tenancy model, etc.)
- `MINOR` (v9.1, v9.2…): shippable feature sets
- `PATCH` (v9.1.1, v9.1.2…): stability, polish, security, perf

### Labels
- **Stable**: passes healthchecks, no critical issues, safe to deploy.
- **Preview**: large refactors; behind feature flags; no production deploy.
- **Hotfix**: small targeted patch off latest stable.

---

## Release cadence (recommended)
- Weekly patch releases during active build: `v9.x.(n)` — stability + polish
- Monthly minor releases: `v9.(x+1).0` — bigger features
- 1–2 major releases per year max

---

## Train Map (high-level)
### Train A — Portalization & Public Website (v9.1.x)
Goal: landing site + separate logins + portal routes without breaking legacy routes.

Planned patches:
- v9.1.0: public landing + `/login/student` `/login/teacher`
- v9.1.1: portal route groups `/student/*` `/teacher/*` `/admin/*`
- v9.1.2: audience persistence + portal switching UI
- v9.1.3: onboarding routing cleanup (no membership cases)
- v9.1.4: accessibility + performance polish

### Train B — Multi-tenant Onboarding Excellence (v9.2.x)
Goal: school/entity signup workflow + approvals + invite hardening.

### Train C — Student “WOW Learning” (v9.3.x)
Goal: calm premium lesson flow, fast, safe, delightful.

### Train D — Teacher Tools (v9.4.x)
Goal: course builder, grading, analytics.

### Train E — Storefront + Checkout Reliability (v9.5.x)
Goal: conversion + trust + idempotency.

### Train F — Observability + QA Automation (v9.6.x)
Goal: CI, tests, performance budgets.

### Train G — Major Platform Upgrade (v10.0)
Goal: everything above + feature flags + robust admin.

---

## PR template (use every time)
Each PR must include:
1) **What changed**
2) **Where it changed** (file paths)
3) **How to run/test**
4) **What’s next**

And must not violate:
- tenancy scoping invariants
- content protection invariants
- “no features removed” rule

---

## Definition of “Done” per build
A build is “done” only when:
- All healthchecks pass
- No regressions to existing features
- Portal nav is consistent
- Access gating remains airtight
- ZIP release contains checksums + BUILDINFO

---

## “ZIP → PR” workflow (your process)
1) You send me the new ZIP (or commit hash).
2) I extract, audit changes, and update:
   - `KNOWN_ISSUES_TECH_DEBT.md`
   - roadmap status
3) I produce a patch plan for the next PR (in the chat) and then code it.
