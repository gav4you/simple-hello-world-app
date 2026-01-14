# Command Palette Spec (Optional, Premium UX) — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

If the project already includes a command palette dependency (or it’s easy to add safely),
implement a Cmd/Ctrl+K palette that searches Feature Registry.

---

## Requirements
- Opens with Cmd/Ctrl+K
- Lists features filtered by user permissions
- Can optionally show vaultOnly items (toggle or separate section)
- Selecting navigates to the canonical route

Fallback:
- If dependency missing and adding is risky, skip without breaking build.
