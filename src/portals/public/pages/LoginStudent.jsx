import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export default function LoginStudent() {
  const { navigateToLogin } = useAuth();

  useEffect(() => {
    try {
      // Canonical intent keys (v9.1+)
      localStorage.setItem('ba_intended_audience', 'student');
      localStorage.setItem('ba_portal_prefix', '/student');

      // Legacy compatibility keys (kept indefinitely)
      localStorage.setItem('portal_intent', 'student');
      localStorage.setItem('portal_prefix', '/student');
      localStorage.setItem('breslov.login.intent', 'student');
    } catch {}
  }, []);

  const handle = () => {
    const origin = window.location.origin;
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get('returnTo');
    const safeReturnTo = (() => {
      if (!returnTo) return null;
      const p = String(returnTo);
      if (p.includes('://')) return null;
      if (!(p.startsWith('/student'))) return null;
      return p;
    })();

    navigateToLogin(safeReturnTo ? `${origin}${safeReturnTo}` : `${origin}/student?loginRole=student`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Student login</h1>
      <p className="mt-4 text-base text-muted-foreground">
        Sign in to access your lessons, quizzes, progress tracking, and community features.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={handle}>Continue to sign in</Button>
        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        After sign in, you’ll be returned to the student dashboard.
      </p>
    </div>
  );
}
