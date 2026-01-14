/**
 * Tenancy Runtime Context (module-level)
 *
 * Why this exists:
 * - Some code paths still call base44.entities.* directly.
 * - We want strict multi-tenant isolation without rewriting 40+ pages at once.
 * - The tenancy enforcer reads the *current* activeSchoolId + userEmail from this module.
 *
 * IMPORTANT:
 * - This is NOT a replacement for useSession().
 * - It is a safety net to prevent accidental cross-school reads.
 */

let runtime = {
  activeSchoolId: null,
  userEmail: null,
};

/**
 * Set current tenancy context (best effort).
 * @param {{ activeSchoolId?: string|null, userEmail?: string|null }} partial
 */
export function setTenancyContext(partial = {}) {
  runtime = {
    ...runtime,
    ...partial,
  };
}

export function getActiveSchoolId() {
  return runtime.activeSchoolId;
}

export function getUserEmail() {
  return runtime.userEmail;
}

export function getTenancySnapshot() {
  return { ...runtime };
}
