import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function getStoredPortalPrefix() {
  try {
    const stored = localStorage.getItem('ba_portal_prefix');
    if (stored && String(stored).startsWith('/')) return String(stored);
  } catch {}
  return '/app';
}

/**
 * Preserves all legacy deep links by redirecting them into the current portal.
 *
 * Examples:
 * - /Dashboard -> /app/Dashboard (or /student/Dashboard if that's the current portal)
 * - /teach/quizzes -> /teacher/teach/quizzes
 * - /my-quizzes -> /app/my-quizzes
 */
export default function LegacyToAppRedirect() {
  const loc = useLocation();
  const pathname = loc.pathname || '/';

  // Avoid loops
  if (pathname.startsWith('/app') || pathname.startsWith('/student') || pathname.startsWith('/teacher') || pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
    return <Navigate to="/app" replace />;
  }

  const prefix = getStoredPortalPrefix();
  const target = `${prefix}${pathname === '/' ? '' : pathname}${loc.search || ''}${loc.hash || ''}`;
  return <Navigate to={target} replace />;
}
