import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getNavGroupsForAudience } from '@/components/config/features';
import { useSession } from '@/components/hooks/useSession';
import { Home, BookOpen, GraduationCap, Shield, Archive } from 'lucide-react';

function IconForArea({ area }) {
  const A = (area || '').toLowerCase();
  if (A === 'core') return <Home className="h-4 w-4" />;
  if (A === 'teach') return <GraduationCap className="h-4 w-4" />;
  if (A === 'admin') return <Shield className="h-4 w-4" />;
  return <BookOpen className="h-4 w-4" />;
}

export default function PortalSidebar({ currentPageName }) {
  const { audience, role } = useSession();
  const a = (audience || (role === 'ADMIN' ? 'admin' : 'student')).toLowerCase();

  const navGroups = useMemo(() => getNavGroupsForAudience(a), [a]);

  return (
    <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Navigation
      </div>

      <div className="space-y-4">
        {navGroups.map((g) => (
          <div key={g.key || g.label}>
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-300">
              <IconForArea area={g.key} />
              <span>{g.label}</span>
            </div>

            <div className="mt-1 space-y-1">
              {(g.features || []).map((f) => {
                const active = String(currentPageName || '').toLowerCase() === String(f.key || '').toLowerCase();
                return (
                  <Link
                    key={f.key}
                    to={createPageUrl(f.key)}
                    className={[
                      "block rounded-lg px-3 py-2 text-sm transition",
                      active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    ].join(' ')}
                  >
                    {f.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-800">
          <Link
            to={createPageUrl('Vault')}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            <Archive className="h-4 w-4" />
            Vault
          </Link>
        </div>
      </div>
    </div>
  );
}
