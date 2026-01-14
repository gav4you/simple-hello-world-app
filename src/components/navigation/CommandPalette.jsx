import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FEATURES } from '@/components/config/features';
import { useSession } from '@/components/hooks/useSession';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Search, Vault, Settings, Home, Building2 } from 'lucide-react';

/**
 * v8.6 CommandPalette
 * - Registry-driven
 * - Keyboard-first (Cmd/Ctrl+K)
 * - Accessible labels
 */
export default function CommandPalette() {
  const navigate = useNavigate();
  const { audience, activeSchool } = useSession();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  const normalizedAudience = (audience || 'student').toLowerCase();

  const features = useMemo(() => {
    const all = Object.values(FEATURES);
    // Keep Vault visible to everyone; hide vaultOnly items from non-admins
    const filtered = all.filter((f) => {
      if (!f) return false;
      if (f.key === 'Vault') return true;
      if (f.vaultOnly && normalizedAudience !== 'admin') return false;
      if (!Array.isArray(f.audiences) || f.audiences.length === 0) return true;
      return f.audiences.includes(normalizedAudience) || f.audiences.includes('all');
    });
    filtered.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    return filtered;
  }, [normalizedAudience]);

  const quickActions = useMemo(() => {
    const actions = [
      {
        key: 'go:home',
        label: 'Go to Dashboard',
        icon: Home,
        onSelect: () => navigate(createPageUrl('Dashboard')),
      },
      {
        key: 'go:vault',
        label: 'Open Vault (all features)',
        icon: Vault,
        onSelect: () => navigate(createPageUrl('Vault')),
      },
    ];
    if (activeSchool?.slug) {
      actions.push({
        key: 'go:storefront',
        label: `Open Storefront (${activeSchool.slug})`,
        icon: Building2,
        onSelect: () => navigate(`/s/${activeSchool.slug}`),
      });
    }
    if (normalizedAudience === 'admin') {
      actions.push({
        key: 'go:schooladmin',
        label: 'School Admin',
        icon: Settings,
        onSelect: () => navigate(createPageUrl('SchoolAdmin')),
      });
    }
    return actions;
  }, [navigate, normalizedAudience, activeSchool?.slug]);

  const onSelect = (fn) => {
    setOpen(false);
    setQuery('');
    fn();
  };

  return (
    <>
      {/* Hidden but accessible trigger for screen readers */}
      <button
        type="button"
        aria-label="Open command palette"
        className="sr-only"
        onClick={() => setOpen(true)}
      />

      <CommandDialog open={open} onOpenChange={setOpen} aria-label="Command palette">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search pages, tools, and actions…"
          aria-label="Search"
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Quick actions">
            {quickActions.map((a) => {
              const Icon = a.icon || Search;
              return (
                <CommandItem key={a.key} value={a.label} onSelect={() => onSelect(a.onSelect)}>
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{a.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            {features.map((feature) => {
              const value = `${feature.label} ${feature.area} ${feature.route}`;
              return (
                <CommandItem
                  key={feature.key}
                  value={value}
                  onSelect={() => onSelect(() => navigate(feature.route))}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span>{feature.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{feature.area}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
