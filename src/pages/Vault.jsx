import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FEATURES, FEATURE_AREAS } from '@/components/config/features';
import { useSession } from '@/components/hooks/useSession';

import PageShell from '@/components/ui/PageShell';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { Archive, ArrowUpRight, Filter, Search } from 'lucide-react';

/**
 * Vault (All Features)
 * Non-negotiable: ALL pages/features remain discoverable, even if main nav is streamlined.
 * Source of truth: components/config/features.jsx
 */
export default function Vault() {
  const { audience, user, activeSchool } = useSession();
  const isAdmin = (audience || '').toLowerCase() === 'admin';
  const currentAudience = useMemo(() => {
    if (isAdmin) return 'admin';
    if (!user) return 'public';
    return (audience || 'student').toLowerCase();
  }, [audience, isAdmin, user]);
  const [q, setQ] = useState('');
  const [area, setArea] = useState('all');
  const [showHidden, setShowHidden] = useState(true);
  const [showVaultOnly, setShowVaultOnly] = useState(true);

  const areas = useMemo(() => {
    const base = Object.keys(FEATURE_AREAS || {});
    return ['all', ...base];
  }, []);

  const allFeatures = useMemo(() => {
    const list = Object.values(FEATURES || {}).filter(Boolean);
    // Stable sort: area then order then label
    return list.sort((a, b) => {
      const ao = (a.order ?? 999) - (b.order ?? 999);
      if (a.area !== b.area) return String(a.area).localeCompare(String(b.area));
      if (ao !== 0) return ao;
      return String(a.label).localeCompare(String(b.label));
    });
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return allFeatures.filter((f) => {
      if (!f) return false;
      if (!showHidden && f.hidden) return false;
      if (!showVaultOnly && f.vaultOnly) return false;
      if (area !== 'all' && f.area !== area) return false;
      if (!needle) return true;
      const hay = `${f.label} ${f.key} ${f.area} ${Array.isArray(f.audiences) ? f.audiences.join(' ') : ''}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [allFeatures, q, area, showHidden, showVaultOnly]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((f) => {
      const k = f.area || 'other';
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(f);
    });
    return Array.from(map.entries()).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  }, [filtered]);

  const actions = (
    <>
      <Link to={createPageUrl('Integrity')}>
        <Button variant="outline">Integrity</Button>
      </Link>
      <Link to={createPageUrl('Dashboard')}>
        <Button>Back to Dashboard</Button>
      </Link>
    </>
  );

  return (
    <PageShell
      title="Vault"
      subtitle="Every feature and page in the platform, organized and searchable. Nothing gets deleted; everything stays discoverable."
      actions={actions}
    >
      <GlassCard className="p-4 sm:p-6">
        <SectionHeader
          title="Find anything"
          description="Search by name, area, or audience. Use filters to narrow results."
          right={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={showHidden ? 'default' : 'outline'}
                onClick={() => setShowHidden((v) => !v)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showHidden ? 'Showing hidden' : 'Hidden off'}
              </Button>
              <Button
                variant={showVaultOnly ? 'default' : 'outline'}
                onClick={() => setShowVaultOnly((v) => !v)}
              >
                <Archive className="mr-2 h-4 w-4" />
                {showVaultOnly ? 'Including Vault-only' : 'Vault-only off'}
              </Button>
            </div>
          }
        />

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search features… (e.g. Lesson Viewer, Monetization, Staff)"
                className="pl-9"
                aria-label="Search features"
              />
            </div>
          </div>
          <div>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background/60 px-3 text-sm"
              aria-label="Filter by area"
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a === 'all' ? 'All areas' : a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>
            Results: <span className="text-foreground font-medium">{filtered.length}</span>
          </span>
          {activeSchool?.name && (
            <span>
              • Active school: <span className="text-foreground font-medium">{activeSchool.name}</span>
            </span>
          )}
          <span>
            • Audience: <span className="text-foreground font-medium">{(audience || (user ? 'student' : 'public')).toLowerCase()}</span>
          </span>
        </div>
      </GlassCard>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Archive}
            title="No features match your search"
            description="Try a different query, clear filters, or toggle hidden/Vault-only items."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQ('');
                  setArea('all');
                  setShowHidden(true);
                  setShowVaultOnly(true);
                }}
              >
                Reset filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {grouped.map(([groupKey, feats]) => (
            <GlassCard key={groupKey} className="p-4 sm:p-6" hover>
              <SectionHeader
                title={groupKey}
                description={`${feats.length} feature${feats.length === 1 ? '' : 's'}`}
              />

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {feats.map((f) => {
                  const aud = Array.isArray(f.audiences) ? f.audiences : [];
                  const audienceOk = (() => {
                    if (isAdmin) return true;
                    if (!aud.length) return true;
                    if (currentAudience === 'teacher') return aud.includes('teacher') || aud.includes('student') || aud.includes('public');
                    if (currentAudience === 'student') return aud.includes('student') || aud.includes('public');
                    if (currentAudience === 'public') return aud.includes('public');
                    return false;
                  })();

                  const isLocked = Boolean(f.vaultOnly && !isAdmin);
                  const canOpen = audienceOk && !isLocked;
                  const restrictedReason = isLocked
                    ? 'Requires admin'
                    : audienceOk
                      ? 'Restricted'
                      : `Requires ${aud.join(' / ')}`;

                  // Prefer canonical dynamic route (registry uses lowercase routes),
                  // but keep PascalCase fallback for deep-link compatibility.
                  const href = f.route || createPageUrl(f.key);

                  return (
                    <GlassCard
                      key={`${f.key}-${f.route}`}
                      className="p-4"
                      hover
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate font-semibold">{f.label}</div>
                            {f.hidden && <StatusBadge status="warning">Hidden</StatusBadge>}
                            {f.vaultOnly && <StatusBadge status={isAdmin ? 'ok' : 'warning'}>Vault-only</StatusBadge>}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground truncate">
                            Key: {f.key} • Route: {href}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(Array.isArray(f.audiences) ? f.audiences : []).slice(0, 6).map((a) => (
                              <StatusBadge key={`${f.key}-${a}`} status="active">
                                {a}
                              </StatusBadge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button asChild size="sm" disabled={!canOpen}>
                            <Link to={href}>
                              Open
                              <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                          {!canOpen && (
                            <div className="text-[11px] text-muted-foreground text-right">
                              {restrictedReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
