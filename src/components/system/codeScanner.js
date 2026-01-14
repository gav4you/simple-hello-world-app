/**
 * Code Scanner (Static, best-effort)
 *
 * Base44 apps do not have server-side enforcement. We must defend in depth.
 * This module provides conservative regex-based scans for common regressions:
 * - Paid content leakage in search/reader
 * - Direct file_url exposure
 * - Dangerous unscoped .list() calls on school-owned entities
 *
 * IMPORTANT:
 * - Scans are best-effort and may false-positive. They should guide investigation.
 * - Do not fetch sensitive data. This scans only source text loaded via Vite ?raw imports.
 */

const RULES = [
  {
    key: 'no_direct_file_url',
    label: 'No direct file_url exposure',
    test: (src) => !/\bfile_url\b/.test(src),
    okMsg: '✅ No file_url references detected.',
    badMsg: '⚠️ file_url appears in source. Ensure it is never exposed in DOM before authorization.'
  },
  {
    key: 'no_search_paid_text',
    label: 'Search must not filter by content/body',
    test: (src) => !/\b(content|body)\b/.test(src) || !/Lesson\.filter\([\s\S]*\b(content|body)\b/m.test(src),
    okMsg: '✅ No obvious paid-text search filters detected.',
    badMsg: '⚠️ Potential paid-text search filter detected (content/body).'
  },
  {
    key: 'avoid_unscoped_list',
    label: 'Avoid unscoped .list() on entities',
    test: (src) => !/\.list\(/.test(src),
    okMsg: '✅ No .list() calls detected in this module.',
    badMsg: '⚠️ .list() call detected. For school-owned entities, prefer scopedFilter/scopedList to enforce school_id + limits.'
  },
];

/**
 * Run scan rules on a named source module.
 * @param {{ moduleKey: string, moduleLabel: string, source: string, rules?: any[] }} args
 */
export function scanSource({ moduleKey, moduleLabel, source, rules = RULES }) {
  const results = [];
  for (const rule of rules) {
    let ok = false;
    try {
      ok = !!rule.test(source);
    } catch {
      ok = false;
    }
    results.push({
      key: `${moduleKey}:${rule.key}`,
      label: `${moduleLabel} — ${rule.label}`,
      ok,
      detail: [ok ? rule.okMsg : rule.badMsg],
    });
  }
  return results;
}

/**
 * A higher signal scan specifically for the Reader page.
 * Reader must gate Text retrieval by entitlements at query time.
 */
export function scanReaderEntitlementGate(source) {
  const hasEntitlementGate = /\$or\s*:\s*\[/.test(source) && /\$in/.test(source) && /(allowedCourseIds|courseIds)/.test(source);
  const hasLimit = /scopedFilter\(['"]Text['"][\s\S]*?,\s*\d+\)/m.test(source) || /,\s*\d+\)\s*;\s*$/m.test(source);
  return {
    key: 'reader:entitlement_gate',
    label: 'Reader — Text query gated by entitlements',
    ok: hasEntitlementGate && hasLimit,
    detail: [
      hasEntitlementGate ? '✅ Found entitlement gate pattern ($or + $in).' : '⚠️ Missing entitlement gate pattern for Text queries.',
      hasLimit ? '✅ Found an explicit query limit.' : '⚠️ Missing an explicit query limit.'
    ]
  };
}

/**
 * Merge scan results for a dictionary of sources.
 * @param {{ [key: string]: { label: string, source: string } }} sources
 */
export function runScans(sources = {}) {
  const out = [];
  for (const [key, entry] of Object.entries(sources)) {
    if (!entry?.source) continue;
    out.push(...scanSource({ moduleKey: key, moduleLabel: entry.label || key, source: entry.source }));
  }
  // Optional high-signal scan for Reader
  if (sources.reader?.source) {
    out.push(scanReaderEntitlementGate(sources.reader.source));
  }
  return out;
}
