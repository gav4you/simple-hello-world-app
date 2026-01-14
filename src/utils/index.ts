/**
 * Base44 route helper.
 *
 * Legacy compatibility:
 * - Historically Base44 projects used /PageName URLs.
 * - This app now also has canonical, human URLs (lowercase) for key areas.
 *
 * This function keeps deep links working while preferring canonical paths
 * from the Feature Registry when available.
 */
import { FEATURES } from '@/components/config/features';

// v9.1 "portalization" (public site + app portal) support.
// - Public marketing routes live at /, /pricing, /about, ...
// - Authenticated application lives under /app/*
// - Storefront stays public under /s/:schoolSlug/*
// We preserve all legacy deep links by keeping route aliases in the router.
const APP_PORTAL_PREFIX = '/app';
const PORTAL_PREFIXES = ['/student', '/teacher', '/admin', '/superadmin', '/app'];

function getCurrentPortalPrefix() {
  try {
    if (typeof window !== 'undefined') {
      const path = (window.location?.pathname || '').toLowerCase();
      const fromPath = PORTAL_PREFIXES.find((p) => path === p || path.startsWith(p + '/'));
      if (fromPath) return fromPath;
      const stored = localStorage.getItem('ba_portal_prefix');
      if (stored && String(stored).startsWith('/')) return String(stored);
    }
  } catch {
    // ignore
  }
  return APP_PORTAL_PREFIX;
}

const PUBLIC_ROUTES = new Set<string>([
  '/',
  '/about',
  '/how-it-works',
  '/pricing',
  '/faq',
  '/contact',
  '/privacy',
  '/terms',
  '/login',
  '/login/student',
  '/login/teacher',
  '/blog',
]);

function isStorefrontRoute(path: string) {
  return path.startsWith('/s/');
}

function isPublicRoute(path: string) {
  if (PUBLIC_ROUTES.has(path)) return true;
  // Treat /blog/* as public
  if (path.startsWith('/blog/')) return true;
  // Treat /legal/* and /login/* as public
  if (path.startsWith('/legal/')) return true;
  if (path.startsWith('/login/')) return true;
  return false;
}

function withAppPortalPrefix(path: string) {
  if (!path.startsWith('/')) return path;

  const portalPrefix = getCurrentPortalPrefix();

  // Already portalized
  if (path.startsWith(portalPrefix + '/')) return path;
  if (path === portalPrefix) return path;

  // Never portalize public/storefront routes
  if (isStorefrontRoute(path) || isPublicRoute(path)) return path;

  // Special case: legacy root becomes portal root
  if (path === '/') return portalPrefix;

  return `${portalPrefix}${path}`;
}

export function createPageUrl(pageName: string, params: Record<string, any> = {}) {
    if (!pageName) return '/';
    // If caller passes a path already, respect it.
    if (pageName.startsWith('/')) {
        // Apply portalization only to app-internal routes.
        return appendQuery(withAppPortalPrefix(pageName), params);
    }

    // Try registry-based canonical routing first.
    try {
        const list = FEATURES ? (Object.values(FEATURES) as any[]) : [];
        const wanted = String(pageName).toLowerCase();
        const match = list.find((f) => {
            const k = String(f?.key || '').toLowerCase();
            const label = String(f?.label || '').toLowerCase();
            return k === wanted || label === wanted;
        });
        if (match?.route) {
            return appendQuery(withAppPortalPrefix(String(match.route)), params);
        }
    } catch {
        // ignore – fallback below
    }

    // Fallback: legacy /PageName convention
    const legacy = '/' + pageName.replace(/ /g, '-');
    return appendQuery(withAppPortalPrefix(legacy), params);
}

function appendQuery(path: string, params: Record<string, any>) {
    const entries = Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '');
    if (entries.length === 0) return path;
    const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
    return path.includes('?') ? `${path}&${qs}` : `${path}?${qs}`;
}