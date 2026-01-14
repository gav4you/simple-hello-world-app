# Tenancy & Data Scoping (Reality)
Prepared: January 01, 2026 (Asia/Jerusalem)

## Core principle
If an entity is “school-scoped”, every query + write must be scoped to `school_id`.

### Source of truth for scoping
- `src/components/api/scopedEntities.js`
  - `SCHOOL_SCOPED_ENTITIES` (must include `school_id`)
  - `GLOBAL_ENTITIES` (no school_id requirement)

### Safe query/write helpers
- `src/components/api/scoped.jsx`
  - `scopedList(entity, schoolId, sort, limit)`
  - `scopedFilter(entity, schoolId, filter)`
  - `scopedCreate(entity, payload, schoolId)`
  - `scopedUpdate(entity, id, payload, schoolId, strict?)`
  - `scopedDelete(entity, id, schoolId, strict?)`

### Runtime enforcement (automatic guard)
- Installed in `src/api/base44Client.js` via `installTenancyEnforcer(...)`
- Runtime context is kept in sync by:
  - `src/components/api/TenancyBridge.jsx`
- Tenancy context lives in:
  - `src/components/api/tenancyRuntime.js` (module state)

## Session source of truth
- `src/components/hooks/useSession.jsx`
  - `activeSchoolId`
  - `activeSchool`
  - `memberships`
  - `role` (per active school)
  - `audience` (student/teacher/admin) derived from role

## Practical coding rules
1) When you touch any page that reads/writes scoped entities:
   - replace direct `base44.entities.X.*` calls with `scoped*`
2) For global admins:
   - use explicit “global escape hatch” functions (as already provided by tenancyEnforcer)
3) Never rely on UI-only tenancy enforcement — the API layer must enforce too.

## Smoke checks to run after tenant changes
(See `HEALTHCHECKS.md` in repo root.)
