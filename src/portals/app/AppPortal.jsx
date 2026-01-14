import React, { Suspense } from 'react';
import { Route, Routes, Navigate, useLocation, useParams } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useAuth } from '@/lib/AuthContext';
import { useSession } from '@/components/hooks/useSession';
import OnboardingHub from './OnboardingHub';
import { pagesConfig } from '@/pages.config';

const RouteFallback = ({ label = 'Loading…' }) => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  </div>
);

const { Pages, Layout } = pagesConfig;

const LayoutWrapper = ({ children, currentPageName }) => Layout
  ? <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

function getPortalHintFromPathname(pathname) {
  const p = String(pathname || '').toLowerCase();
  if (p.startsWith('/teacher')) return 'teacher';
  if (p.startsWith('/admin')) return 'admin';
  if (p.startsWith('/superadmin')) return 'admin';
  if (p.startsWith('/student')) return 'student';
  if (p.startsWith('/app')) return 'app';
  return null;
}

const AppIndexRedirect = () => {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search || '');
  const loginRole = (params.get('loginRole') || '').toLowerCase();
  const portalHint = getPortalHintFromPathname(loc.pathname);

  const { user, memberships, activeSchool, role, audience, isLoading } = useSession();

  if (isLoading) return <RouteFallback label="Loading session…" />;

  // If user not yet registered with any school, go to onboarding.
  if (user && Array.isArray(memberships) && memberships.length === 0) {
    return <Navigate to="onboarding" replace />;
  }

  // If memberships exist but no active school, route to school selection.
  const needsSchoolSelection = user && Array.isArray(memberships) && memberships.length > 0 && !activeSchool;
  if (needsSchoolSelection) {
    return <Navigate to="SchoolSelect" replace />;
  }

  let intended = loginRole || portalHint;
  if (!intended) {
    try { intended = (localStorage.getItem('ba_intended_audience') || '').toLowerCase(); } catch {}
  }

  const a = (audience || '').toLowerCase();
  const r = (role || '').toUpperCase();
  const isTeacher = a === 'teacher' || a === 'admin' || r === 'TEACHER' || r === 'ADMIN' || r === 'OWNER';
  const isTeacherHint = intended === 'teacher' || intended === 'admin';

  // Portal-specific landings (portalization)
  const p = String(loc.pathname || '').toLowerCase();
  if (p.startsWith('/superadmin')) {
    return <Navigate to="NetworkAdmin" replace />;
  }
  if (p.startsWith('/admin')) {
    return <Navigate to="SchoolAdmin" replace />;
  }

  return <Navigate to={(isTeacher || isTeacherHint) ? "teach" : "dashboard"} replace />;
};

// Case-insensitive / legacy route support inside the app portal.
const DynamicPageRoute = ({ fallbackLabel = 'Loading page…' }) => {
  const { pageName } = useParams();
  const seg = (pageName || '').trim();
  const matchKey = Object.keys(Pages).find((k) => k.toLowerCase() === seg.toLowerCase());
  if (!matchKey) return <PageNotFound />;
  const Page = Pages[matchKey];
  return (
    <LayoutWrapper currentPageName={matchKey}>
      <Suspense fallback={<RouteFallback label={fallbackLabel} />}>
        <Page />
      </Suspense>
    </LayoutWrapper>
  );
};

/**
 * Authenticated application portal.
 * Mounted at /app/* and also reused by /student/*, /teacher/*, /admin/*, /superadmin/*.
 */
export default function AppPortal() {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return <RouteFallback label="Loading…" />;
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  if (authError?.type === 'auth_required') {
    navigateToLogin();
    return null;
  }

  return (
    <Routes>
      <Route index element={<AppIndexRedirect />} />
      <Route path="onboarding" element={<OnboardingHub />} />

      {/* Canonical quiz routes (v9.0/v9.1) */}
      <Route path="my-quizzes" element={<Pages.MyQuizzes />} />
      <Route path="quiz/:quizId" element={<Pages.QuizTake />} />
      <Route path="teach/quizzes" element={<Pages.TeachQuizzes />} />
      <Route path="teach/quizzes/new" element={<Pages.TeachQuizEditor />} />
      <Route path="teach/quizzes/:quizId" element={<Pages.TeachQuizEditor />} />

      {/* Registry + legacy single-segment routes */}
      <Route path=":pageName" element={<DynamicPageRoute />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
