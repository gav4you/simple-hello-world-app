/**
 * Query & Tenancy Contracts
 *
 * Base44 is an app-layer-only platform: we do not have server-side row-level security.
 * These helpers standardize safety rules that must hold across the entire codebase.
 *
 * Use cases:
 * - Normalize query limits (avoid accidental unbounded queries)
 * - Produce consistent diagnostics in /integrity
 */

export const MAX_QUERY_LIMIT = 200;
export const DEFAULT_QUERY_LIMIT = 50;

/**
 * Normalize query limit to a safe integer cap.
 * @param {number|undefined|null} limit
 * @param {number} [fallback]
 */
export function normalizeLimit(limit, fallback = DEFAULT_QUERY_LIMIT) {
  const n = Number(limit);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), MAX_QUERY_LIMIT);
}

/**
 * Best-effort check: returns true if an object contains a school_id key.
 * @param {any} filters
 */
export function hasSchoolIdFilter(filters) {
  try {
    return !!filters && typeof filters === 'object' && Object.prototype.hasOwnProperty.call(filters, 'school_id');
  } catch {
    return false;
  }
}
