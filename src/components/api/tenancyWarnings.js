/**
 * Tenancy Warnings (Runtime)
 *
 * This module stores best-effort warnings emitted by the runtime tenancy enforcer.
 * It enables /integrity to surface regressions that might otherwise be silent.
 *
 * Design goals:
 * - Never throw.
 * - Keep only a bounded recent history.
 * - Store minimal metadata (no sensitive lesson text).
 */

const MAX_WARNINGS = 150;

/** @type {Array<{ts:string,type:string,entity?:string,detail?:any,school_id?:string|null,user_email?:string|null}>} */
let warnings = [];

export function recordTenancyWarning(evt) {
  try {
    const ts = new Date().toISOString();
    const normalized = {
      ts,
      type: evt?.type || 'UNKNOWN',
      entity: evt?.entity,
      detail: evt?.detail,
      school_id: evt?.school_id ?? null,
      user_email: evt?.user_email ?? null,
    };
    warnings = [normalized, ...warnings].slice(0, MAX_WARNINGS);
  } catch {
    // never throw
  }
}

export function getTenancyWarnings() {
  return warnings;
}

export function clearTenancyWarnings() {
  warnings = [];
}

export function getTenancyWarningsSummary() {
  const counts = {};
  for (const w of warnings) {
    counts[w.type] = (counts[w.type] || 0) + 1;
  }
  return {
    total: warnings.length,
    counts,
    latest: warnings[0] || null,
  };
}
