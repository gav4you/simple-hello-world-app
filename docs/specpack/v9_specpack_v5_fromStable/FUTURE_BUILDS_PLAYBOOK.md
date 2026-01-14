# Future Builds — Detailed Playbook (Always Improving)
Prepared: January 01, 2026 (Asia/Jerusalem)

## The loop (repeat every build)
1) Measure (activation, learning, money, reliability)
2) Pick 3–5 high-impact items + 5–10 quality items
3) Ship safely (small PRs, flags if risky)
4) QA + integrity export
5) Review + document + update backlog

## Parallel tracks (always-on)
- UX polish
- Security/trust
- Performance/stability
- Conversion/onboarding

## Never-regress guard rails
- Feature registry diff check each build
- Locked-content network-call monitor (best-effort)
- Tenant-scope tracer (best-effort)
- Money idempotency tests
