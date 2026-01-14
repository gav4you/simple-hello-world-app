# Design System + UI/UX Spec (WOW + calm + academic) — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

This document defines the design system that must be reused across **all** surfaces.

---

## 1) Design goals
- University-grade: structured, confident, not flashy.
- Eye-strain friendly: no harsh whites; comfortable reading surfaces.
- Clear hierarchy: predictable layouts, strong typography, generous spacing.
- Accessibility-first: keyboard navigation, focus rings, contrast, reduced motion.
- Delight without distraction: subtle motion, premium micro-interactions.

---

## 2) Theming + tokens
### 2.1 Color system
Define tokens (example naming; adapt to existing system):
- `bg.canvas`, `bg.surface`, `bg.elevated`, `bg.overlay`
- `text.primary`, `text.secondary`, `text.muted`
- `border.default`, `border.subtle`
- `brand.primary`, `brand.accent`
- semantic: `success`, `warning`, `error`, `info`

Modes:
- Light (soft ivory/gray, not pure white)
- Dark
- Night Reading (extra low contrast + warm)

### 2.2 Typography
- Set a readable font stack and a consistent scale:
  - Display / H1 / H2 / H3
  - Body
  - Small
  - Caption
- Increase line-height for lesson text.
- Use max-widths for reading (e.g., 60–75ch).

### 2.3 Spacing & layout
- 8pt grid.
- Consistent breakpoints.
- Layout patterns:
  - Dashboard: header + cards
  - Data pages: filters + table/cards
  - Reader: centered column + sticky TOC

---

## 3) Component library (must be shared)
### 3.1 Base components
- Button (primary/secondary/ghost/destructive), IconButton
- Input, Textarea, Select, Combobox, DatePicker
- Tabs, Segmented control
- Modal/Dialog, Drawer
- Tooltip, Popover, DropdownMenu
- Toasts/notifications
- Badge/StatusPill
- Table (responsive: collapses to cards on mobile)
- Card
- Skeleton loaders
- EmptyState blocks

### 3.2 LMS components
- CourseCard (cover + meta + CTA)
- LessonViewerChrome (title, progress, actions)
- LessonAccessGate (locked/drip/unlocked UI)
- ProgressWidget (course + lesson)
- GradebookTable + rubric UI
- AssignmentComposer + SubmissionViewer
- MessageComposer + ThreadList
- Timeline/Schedule for drip

### 3.3 Storefront components
- SchoolHero (branding)
- OfferCard, PricingTable, BundleTile
- CheckoutSummary, CouponInput, PaymentCTA
- TrustBadges, Testimonials, FAQ accordion

---

## 4) UX patterns
- Loading: skeletons (avoid spinners for whole pages).
- Empty states: explain “why” + one primary action.
- Inline validation: friendly, exact error messages.
- Reduced motion: respect `prefers-reduced-motion`.

---

## 5) Revamp strategy (no breakage)
1) Replace **global shell** first (layout, nav, tokens).
2) Convert modules behind stable routes.
3) Preserve backend behavior; use adapters, not rewrites.
4) Polish pass last: animation, accessibility audit, perf budgets.
