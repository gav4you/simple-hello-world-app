import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, DollarSign, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import VirtualizedList from '@/components/system/VirtualizedList';

// GLOBAL ADMIN LIST (env var or hardcoded)
const GLOBAL_ADMINS = (import.meta.env.VITE_GLOBAL_ADMINS || 'admin@breslov.com').split(',').map(e => e.trim());

export default function NetworkAdmin() {
  const [user, setUser] = useState(null);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Check global admin status
        const { isGlobalAdmin: checkGlobalAdmin } = await import('../components/auth/roles');
        const isAdmin = checkGlobalAdmin(currentUser.email) || currentUser.role === 'admin';
        setIsGlobalAdmin(isAdmin);
        
        if (!isAdmin) {
          toast.error('Global admin access required');
          window.location.href = createPageUrl('Dashboard');
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: allSchools = [] } = useQuery({
    queryKey: ['all-schools'],
    queryFn: () => base44.entities.School.list('-created_date', 100),
    enabled: isGlobalAdmin
  });

  const { data: allTransactions = [] } = useQuery({
    queryKey: ['all-transactions'],
    queryFn: () => base44.entities.Transaction.filterGlobal({ status: 'completed' }, '-created_date', 1000),
    enabled: isGlobalAdmin
  });

  const { data: allMembers = [] } = useQuery({
    queryKey: ['all-members'],
    queryFn: () => base44.entities.SchoolMembership.listGlobal('-created_date', 1000),
    enabled: isGlobalAdmin
  });

  const createSchoolMutation = useMutation({
    mutationFn: async (data) => {
      const school = await base44.entities.School.create(data);
      
      // Create owner membership
      await base44.entities.SchoolMembership.create({
        school_id: school.id,
        user_email: data.owner_email,
        role: 'OWNER'
      });
      
      // Create default protection policy
      await base44.entities.ContentProtectionPolicy.create({
        school_id: school.id,
        protect_content: true,
        allow_previews: true,
        max_preview_seconds: 90,
        max_preview_chars: 1500,
        copy_mode: 'ADDON',
        download_mode: 'ADDON'
      });
      
      return school;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-schools']);
      toast.success('School created');
      setShowCreateForm(false);
    }
  });

  if (!isGlobalAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Card>
          <CardContent className="p-12">
            <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Global Admin Required</h2>
            <p className="text-slate-600">
              This page is only accessible to network administrators
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRevenue = allTransactions.reduce((sum, t) => sum + (t.amount_cents || 0), 0);

  // Precompute per-school aggregates for O(1) lookups during render.
  const membersCountBySchool = useMemo(() => {
    const map = new Map();
    for (const m of allMembers) {
      if (!m?.school_id) continue;
      map.set(m.school_id, (map.get(m.school_id) || 0) + 1);
    }
    return map;
  }, [allMembers]);

  const revenueCentsBySchool = useMemo(() => {
    const map = new Map();
    for (const t of allTransactions) {
      if (!t?.school_id) continue;
      map.set(t.school_id, (map.get(t.school_id) || 0) + (t.amount_cents || 0));
    }
    return map;
  }, [allTransactions]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Network Administration</h1>
          <p className="text-slate-600">Manage all schools across the platform</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Create School
        </Button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{allSchools.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{allMembers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${(totalRevenue / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{allTransactions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Create School Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New School</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                createSchoolMutation.mutate({
                  name: formData.get('name'),
                  slug: formData.get('slug'),
                  description: formData.get('description'),
                  owner_email: formData.get('owner_email'),
                  created_by_user: user.email
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input name="name" required />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input name="slug" required placeholder="my-school" />
              </div>
              <div className="space-y-2">
                <Label>Owner Email</Label>
                <Input name="owner_email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" rows={3} />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={createSchoolMutation.isPending}>
                  Create School
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Schools List */}
      <Card>
        <CardHeader>
          <CardTitle>All Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <VirtualizedList
            items={allSchools}
            initialCount={24}
            chunkSize={24}
            className="space-y-3"
            getKey={(s) => s.id}
            renderItem={(school) => {
              const memberCount = membersCountBySchool.get(school.id) || 0;
              const schoolRevenue = revenueCentsBySchool.get(school.id) || 0;

              return (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold">{school.name}</h4>
                      <p className="text-sm text-slate-600">/{school.slug}</p>
                    </div>
                    <Badge>{school.created_by_user}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-slate-600">Members</p>
                      <p className="font-semibold">{memberCount}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Revenue</p>
                      <p className="font-semibold text-green-600">${(schoolRevenue / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Created</p>
                      <p className="font-semibold">{new Date(school.created_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}