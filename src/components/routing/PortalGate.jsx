import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useSession } from '@/components/hooks/useSession';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

/**
 * PortalGate
 * - Enforces auth + (optional) role/audience
 * - Persists v9.1 portal intent keys:
 *   - ba_intended_audience: student | teacher | admin
 *   - ba_portal_prefix: /student | /teacher | /admin | /superadmin | /app
 * - Keeps legacy key for backwards compatibility: breslov.login.intent
 */
export default function PortalGate({
  portalPrefix = '/app',
  intendedAudience = 'student',
  allowedAudiences = null, // e.g. ['teacher','admin']
  children,
}) {
  const loc = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();
  const { isLoading: isLoadingSession, audience } = useSession();

  useEffect(() => {
    try {
      localStorage.setItem('ba_intended_audience', String(intendedAudience || 'student'));
      localStorage.setItem('ba_portal_prefix', String(portalPrefix || '/app'));
      localStorage.setItem('breslov.login.intent', String(intendedAudience || 'student'));
    } catch {
      // ignore
    }
  }, [portalPrefix, intendedAudience]);

  if (isLoadingPublicSettings || isLoadingAuth || isLoadingSession) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // If auth is required / missing, kick to IdP login with return URL
  if (authError?.type === 'auth_required' || !isAuthenticated) {
    const nextUrl = `${window.location.origin}${loc.pathname}${loc.search || ''}${loc.hash || ''}`;
    navigateToLogin(nextUrl);
    return null;
  }

  // Enforce audience (if requested)
  if (Array.isArray(allowedAudiences) && allowedAudiences.length > 0) {
    const a = (audience || 'student').toLowerCase();
    const ok = allowedAudiences.map(x => String(x).toLowerCase()).includes(a);
    if (!ok) {
      // Send user to their likely correct portal
      const fallback = a === 'admin' ? '/admin' : a === 'teacher' ? '/teacher' : '/student';
      return <Navigate to={fallback} replace />;
    }
  }

  return <>{children}</>;
}
