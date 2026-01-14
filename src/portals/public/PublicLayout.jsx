import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

/**
 * Public marketing portal layout (v9.1 portalization)
 * - Guest-safe: never blocks rendering on auth checks.
 * - Uses AuthContext only for sign-in actions.
 */
export default function PublicLayout() {
  const { navigateToLogin } = useAuth();
  const loc = useLocation();

  const NavLink = ({ to, children }) => {
    const active = loc.pathname === to || (to !== '/' && loc.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={[
          "rounded-lg px-3 py-2 text-sm transition",
          active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        ].join(' ')}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-semibold tracking-tight">Breslov Academy</Link>
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/how-it-works">How it works</NavLink>
              <NavLink to="/pricing">Pricing</NavLink>
              <NavLink to="/faq">FAQ</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link to="/login/student">Student Login</Link>
            </Button>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link to="/login/teacher">Teacher Login</Link>
            </Button>
            <Button onClick={() => navigateToLogin()}>Open the App</Button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} Breslov Academy</div>
            <div className="flex gap-4">
              <Link className="hover:text-foreground" to="/privacy">Privacy</Link>
              <Link className="hover:text-foreground" to="/terms">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
