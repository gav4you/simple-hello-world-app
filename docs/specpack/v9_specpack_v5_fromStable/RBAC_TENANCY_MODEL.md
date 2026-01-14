# RBAC + Tenant Scoping Model — v9.0
Prepared: January 01, 2026 (Asia/Jerusalem)

---

## 1) Roles
Baseline roles:
- Guest (public only)
- Student
- Teacher
- School Admin (tenant admin)
- Org Owner (tenant owner; billing + high privilege)
- Platform Admin / Super Admin (global)

Notes:
- A user may have multiple tenant memberships (multi-school).
- A user may be a student in one tenant and teacher/admin in another.

---

## 2) Authorization principles
- Deny by default; allow only via explicit role.
- UI may hide actions; server/app-layer guards are authoritative.
- All data operations must be tenant-scoped.

---

## 3) Tenant scoping rules
### 3.1 For authenticated portal requests
- Determine `activeSchoolId` from session.
- All entity queries must include `school_id == activeSchoolId` (or equivalent tenant field).

### 3.2 For public storefront requests
- Resolve `schoolSlug` -> `school_id` once at layout/root.
- Use that `school_id` to scope all storefront queries.

### 3.3 Prohibited patterns
- Never query tenant-scoped entities without a tenant filter.
- Never accept client-supplied tenant_id as “truth.”

---

## 4) Permissions matrix (minimum viable)
Legend: R=read, W=write, A=approve/admin, X=none

| Capability | Guest | Student | Teacher | School Admin | Owner | SuperAdmin |
|---|---|---|---|---|---|---|
| Browse marketing/storefront | R | R | R | R | R | R |
| View course sales pages | R | R | R | R | R | R |
| Enroll/purchase | W | W | W | W | W | W |
| View lesson materials (unlocked) | X | R | R | R | R | R |
| Create/edit courses/lessons | X | X | W | W | W | W |
| Grade assignments | X | X | W | A | A | A |
| View analytics | X | R (own) | R/W | A | A | A |
| Manage users/invites | X | X | X | A | A | A |
| Configure branding/terminology | X | X | X | A | A | A |
| Configure protection policy | X | X | X | A | A | A |
| Monetization config | X | X | X | A | A | A |
| Payouts batching | X | X | X | A | A | A |
| Cross-tenant access | X | X | X | X | X | A |
| Impersonation | X | X | X | X | X | A |

---

## 5) Route guards
- `/student/*` requires authenticated + membership role includes Student (or higher) in activeSchool.
- `/teacher/*` requires Teacher/Admin/Owner.
- `/admin/*` requires School Admin/Owner.
- `/superadmin/*` requires SuperAdmin.
- `/integrity`, `/migration-tools`, `/audit-log-viewer` are admin-only and ideally vaultOnly.

---

## 6) Audit logging requirements
Log these events with actor + tenant + timestamp + metadata:
- Role changes, membership changes
- Invite created/accepted/revoked
- Tenant settings changes
- Protection policy changes
- Offer/coupon changes
- Transaction approvals/refunds
- Download URL reveal events
- Impersonation start/stop
