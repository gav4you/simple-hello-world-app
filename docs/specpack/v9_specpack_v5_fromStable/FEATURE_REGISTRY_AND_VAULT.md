# Feature Registry + Vault Spec — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

Goal: A single registry drives navigation, Vault, command palette, and integrity diagnostics.

---

## 1) Registry module
Location (choose one; confirm in Phase 0):
- `src/config/features.ts` (or `.js`)
- OR `src/registry/featureRegistry.ts`

Registry entry schema:
- `key` (string, stable id)
- `label`
- `description` (short)
- `route` (canonical)
- `aliases[]` (legacy)
- `area` (core | teach | admin | marketing | labs | system | vault)
- `audiences[]` (student | teacher | admin | superadmin)
- `vaultOnly` (boolean)
- `showInMainNav` (boolean)
- `order` (number)
- `requiredRoles[]` (optional)

Helpers:
- `getFeatureByKey(key)`
- `getAllFeatures()`
- `getVaultFeatures(options)` where `options` includes `audience`, `roles`, `tenant`
- `getMainNavFeatures(options)` where `options` includes `audience`, `roles`, `tenant`
- `getAllRoutes()`
- `normalizeAudienceFromRole(roleString)`

Rules:
- Do **not** inline feature arrays in any UI page (Vault/nav).
- Vault must render full accessible directory (filtered only by permissions).
- Main nav is streamlined; everything else stays in Vault.

---

## 2) Vault requirements
- Search/filter by label/area/audience.
- Badges: area + vaultOnly + audiences.
- “Open” button navigates to route.
- If feature is not accessible, don’t render it.

---

## 3) Legacy route compatibility
- All old routes must be in `aliases[]`.
- Add redirect adapters for common deep links.
- Preserve query string and hash fragments.

---

## 4) Integrity checks
Admin-only diagnostic (page can be vaultOnly):
- Feature count and list
- Route list
- Best-effort route existence check vs router map
- Warnings for features missing pages
- Link to Vault + key admin pages

Export report JSON:
- timestamp
- tenant/school id
- checks [{
    "key": "string",
    "status": "pass|warn|fail",
    "message": "string"
  }]
- warnings []
- environment { "appVersion": "string?", "buildTime": "string?" }
