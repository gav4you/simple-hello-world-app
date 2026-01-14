# Premium UI/UX Revamp Plan (University-grade, Calm, WOW)
Prepared: January 01, 2026 (Asia/Jerusalem)

This codebase already has:
- Tailwind
- shadcn/ui + Radix
- Theme tokens: `src/components/theme/tokens`
- Theme toggle: `src/components/theme/ThemeToggle`

## Strategy: “Shell first, then modules”
1) Upgrade tokens + themes (light/dark/night)
2) Make Layout + PageShell consistent
3) Standardize reusable components (cards, tables, forms, empty states)
4) Convert pages module-by-module without feature loss
5) Final polish: micro-interactions, accessibility audit, perf budgets

## Hard requirements
- No harsh whites (use surfaces)
- Large readable typography
- Reduced motion support
- Responsive layouts, especially dashboard + course pages

## Deliverables (concrete)
- Token updates:
  - `src/components/theme/tokens.*`
- New component primitives:
  - `GlassCard` (already exists)
  - `DataTable`, `StatCard`, `KPIGrid`
  - `WizardShell` (for onboarding)
- Landing hero:
  - subtle gradients, strong type, CTAs
