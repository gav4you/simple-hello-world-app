import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { BookOpen, GraduationCap, Users, Menu, X, LogOut, User, Plug, Beaker, ChevronDown, Settings, BookMarked, Search, Archive } from 'lucide-react';
import { canCreateCourses } from '@/components/utils/permissions';
import { useSession } from '@/components/hooks/useSession';
import IconButton from '@/components/ui/IconButton';
import { tokens, cx } from '@/components/theme/tokens';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import ThemeToggle from '@/components/theme/ThemeToggle';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import SchoolSwitcher from '@/components/school/SchoolSwitcher';
import CommandPalette from '@/components/navigation/CommandPalette';
import PortalSidebar from '@/portals/shared/PortalSidebar';
import { FEATURES, getNavGroupsForAudience } from '@/components/config/features';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    user,
    memberships,
    activeSchool,
    audience,
    isAdmin,
    isTeacher,
    isLoading,
    changeActiveSchool,
  } = useSession();

  const activeMembership = useMemo(() => {
    if (!activeSchool) return null;
    return memberships?.find(m => m.school_id === activeSchool.id) || null;
  }, [memberships, activeSchool]);

  const canTeach = activeMembership ? canCreateCourses(activeMembership.role) : isTeacher;
  const isSchoolAdmin = activeMembership ? ['OWNER', 'ADMIN'].includes(activeMembership.role) : isAdmin;

  const handleSchoolChange = async (schoolId) => {
    await changeActiveSchool(schoolId);
  };

  const userAudience = audience || (isSchoolAdmin ? 'admin' : (canTeach ? 'teacher' : 'student'));

  // Build nav from registry
  const navGroups = useMemo(() => getNavGroupsForAudience(userAudience), [userAudience]);
  const coreNav = navGroups.find(g => g.label === 'Core Learning')?.features || [];
  const teachNav = navGroups.find(g => g.label === 'Teaching Tools')?.features || [];

  // Core navigation (registry-driven, fallback to hardcoded)
  const coreNavigation = coreNav.length > 0 
    ? coreNav.map(f => ({
        name: f.label,
        path: f.key,
        icon: BookOpen
      }))
    : [
        { name: 'Dashboard', path: 'Dashboard', icon: BookOpen },
        { name: 'Courses', path: 'Courses', icon: GraduationCap },
        { name: 'Reader', path: 'Reader', icon: BookMarked },
        { name: 'Community', path: 'Feed', icon: Users },
        { name: 'Search', path: 'SchoolSearch', icon: Search },
      ];

  // Add teaching nav if applicable
  if (canTeach && teachNav.length > 0) {
    teachNav.forEach(f => {
      if (!f.hidden && !f.vaultOnly) {
        coreNavigation.push({
          name: f.label,
          path: f.key,
          icon: BookOpen
        });
      }
    });
  }

  // Labs features - advanced/experimental
  const labsFeatures = [
    { name: 'Language Learning', path: 'Languages', icon: BookOpen },
    { name: 'Study Sets', path: 'StudySets', icon: BookOpen },
    { name: 'Challenges', path: 'Challenges', icon: BookOpen },
    { name: 'Achievements', path: 'Achievements', icon: BookOpen },
    { name: 'Live Streams', path: 'LiveStreams', icon: BookOpen },
    { name: 'Analytics', path: 'Analytics', icon: BookOpen },
    { name: 'Career Paths', path: 'CareerPaths', icon: BookOpen },
  ];

  return (
    <div className={tokens.page.outer}>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Dashboard')} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-amber-500/50 transition-all">
                <BookOpen className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Breslov Academy</h1>
                <p className="text-xs text-amber-500/90 dark:text-amber-400">Torah of Rebbe Nachman</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {coreNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    className={cx(
                      tokens.glass.navItem,
                      isActive ? tokens.glass.navItemActive : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}

              {/* Labs Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cx(tokens.glass.navItem, 'text-muted-foreground hover:text-foreground')}>
                    <Beaker className="w-4 h-4 mr-2" />
                    Labs
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Experimental Features</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {labsFeatures.map((feature) => (
                    <DropdownMenuItem key={feature.name} asChild>
                      <Link to={createPageUrl(feature.path)} className="cursor-pointer">
                        {feature.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Vault Link */}
              <Link
                to={createPageUrl('Vault')}
                className={cx(
                  tokens.glass.navItem,
                  currentPageName === 'Vault'
                    ? tokens.glass.navItemActive
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Archive className="w-4 h-4" />
                <span className="font-medium text-sm">Vault</span>
              </Link>

              {/* Command Palette */}
              <CommandPalette audience={userAudience} />
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {user && (
                <>
                  <SchoolSwitcher 
                    activeSchool={activeSchool}
                    memberships={memberships}
                    onSchoolChange={handleSchoolChange}
                    isAdmin={isSchoolAdmin}
                  />
                  <NotificationCenter user={user} />
                  <ThemeToggle userEmail={user.email} />
                  <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className={cx(tokens.glass.navItem, 'text-muted-foreground hover:text-foreground')}>
                              <User className="w-4 h-4 mr-2" />
                              {user.full_name}
                              <ChevronDown className="w-3 h-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                              <div className="text-sm">{user.full_name}</div>
                              <div className="text-xs text-slate-500">{user.email}</div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl('Portfolio')}>Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl('Integrations')}>Integrations</Link>
                            </DropdownMenuItem>
                            {isSchoolAdmin && (
                              <DropdownMenuItem asChild>
                                <Link to={createPageUrl('SchoolAdmin')}>School Admin</Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <Link to={createPageUrl('Vault')}>Vault (All Features)</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => base44.auth.logout()}>
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign Out
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <IconButton
                label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </IconButton>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/70 backdrop-blur">
            <div className="px-4 py-4 space-y-2">
              {coreNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cx(
                      tokens.glass.navItem,
                      'justify-start px-4 py-3',
                      isActive ? tokens.glass.navItemActive : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              {/* Labs Section */}
              <div className="pt-2 pb-1 px-4">
                <p className="text-xs text-muted-foreground font-semibold">LABS</p>
              </div>
              {labsFeatures.map((feature) => (
                <Link
                  key={feature.name}
                  to={createPageUrl(feature.path)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cx(tokens.glass.navItem, 'justify-start px-4 py-3 text-muted-foreground hover:text-foreground')}
                >
                  <Beaker className="w-5 h-5" />
                  <span className="font-medium">{feature.name}</span>
                </Link>
              ))}

              {/* Other Links */}
              {canTeach && (
                <Link
                  to={createPageUrl('Teach')}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cx(tokens.glass.navItem, 'justify-start px-4 py-3 text-muted-foreground hover:text-foreground')}
                >
                  <BookMarked className="w-5 h-5" />
                  <span className="font-medium">Teach</span>
                </Link>
              )}
              <Link
                to={createPageUrl('Integrations')}
                onClick={() => setMobileMenuOpen(false)}
                className={cx(tokens.glass.navItem, 'justify-start px-4 py-3 text-muted-foreground hover:text-foreground')}
              >
                <Plug className="w-5 h-5" />
                <span className="font-medium">Integrations</span>
              </Link>
              <Link
                to={createPageUrl('Portfolio')}
                onClick={() => setMobileMenuOpen(false)}
                className={cx(tokens.glass.navItem, 'justify-start px-4 py-3 text-muted-foreground hover:text-foreground')}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>

              {user && (
                <button
                  onClick={() => base44.auth.logout()}
                  className={cx(tokens.glass.navItem, 'w-full justify-start px-4 py-3 text-muted-foreground hover:text-foreground')}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <aside className="hidden md:block w-72 shrink-0">
            <PortalSidebar currentPageName={currentPageName} />
          </aside>
          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              © 2024 Breslov Academy • Spreading the Torah of Rebbe Nachman of Breslov
            </p>
            <p className="text-slate-500 text-xs mt-2">
              "It is a great mitzvah to always be happy" - Likutey Moharan II:24
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}