import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Mail, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InviteAccept() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Not logged in - store token and redirect
        if (token) {
          localStorage.setItem('pending_invite_token', token);
          base44.auth.redirectToLogin(window.location.pathname + window.location.search);
        }
      }
    };
    loadUser();
  }, [token]);

  const { data: invite } = useQuery({
    queryKey: ['invite', token],
    queryFn: async () => {
      const invites = await base44.entities.StaffInvite.filter({ token });
      return invites[0];
    },
    enabled: !!token
  });

  const { data: school } = useQuery({
    queryKey: ['school', invite?.school_id],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ id: invite.school_id });
      return schools[0];
    },
    enabled: !!invite?.school_id
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async () => {
      // Validate
      if (!invite || !user) throw new Error('Invalid state');
      if (invite.status !== 'PENDING') throw new Error('Invite already used');
      if (new Date(invite.expires_at) < new Date()) throw new Error('Invite expired');
      if (invite.email !== user.email) throw new Error('Email mismatch');
      
      // Check if membership already exists
      const existing = await base44.entities.SchoolMembership.filter({
        school_id: invite.school_id,
        user_email: user.email
      });
      
      if (existing.length === 0) {
        // Create membership
        await base44.entities.SchoolMembership.create({
          school_id: invite.school_id,
          user_email: user.email,
          role: invite.role,
          joined_at: new Date().toISOString()
        });
      } else {
        // Update role if different
        if (existing[0].role !== invite.role) {
          await base44.entities.SchoolMembership.update(existing[0].id, {
            role: invite.role
          });
        }
      }
      
      // Mark invite as accepted
      await base44.entities.StaffInvite.update(invite.id, {
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString()
      });
      
      // Log action
      await base44.entities.AuditLog.create({
        school_id: invite.school_id,
        user_email: user.email,
        action: 'STAFF_INVITE_ACCEPTED',
        entity_type: 'StaffInvite',
        entity_id: invite.id,
        metadata: { role: invite.role }
      });
      
      // Set active school
      localStorage.setItem('active_school_id', invite.school_id);
      localStorage.removeItem('pending_invite_token');
    },
    onSuccess: () => {
      toast.success('Welcome to the school!');
      navigate(createPageUrl('Dashboard'));
      window.location.reload(); // Refresh session
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  if (!invite) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invalid Invite</h2>
            <p className="text-slate-600">This invitation link is invalid or expired</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invite.expires_at) < new Date();
  const isUsed = invite.status !== 'PENDING';
  const emailMismatch = user && invite.email !== user.email;

  if (isExpired || isUsed || emailMismatch) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Cannot Accept Invite</h2>
            <p className="text-slate-600">
              {isExpired && 'This invitation has expired'}
              {isUsed && 'This invitation has already been used'}
              {emailMismatch && `This invite is for ${invite.email}, but you're logged in as ${user.email}`}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-3xl">You're Invited!</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-center">
              <p className="text-sm text-blue-900 mb-2">You've been invited to join</p>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">
                {school?.name || 'Loading...'}
              </h2>
              <Badge className="bg-blue-600 text-white">
                as {invite.role}
              </Badge>
            </div>

            {user ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Logged in as {user.email}</span>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => acceptInviteMutation.mutate()}
                  disabled={acceptInviteMutation.isPending}
                >
                  {acceptInviteMutation.isPending ? 'Accepting...' : 'Accept Invitation'}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-slate-600 mb-4">Please sign in to accept this invitation</p>
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => base44.auth.redirectToLogin(window.location.pathname + window.location.search)}
                >
                  Sign In
                </Button>
              </div>
            )}

            <p className="text-xs text-slate-500 text-center mt-6">
              Invited by {invite.invited_by_email}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}