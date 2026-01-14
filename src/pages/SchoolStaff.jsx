import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Mail, Copy, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { scopedFilter, scopedCreate } from '../components/api/scoped';
import { isSchoolAdmin } from '../components/auth/roles';

export default function SchoolStaff() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [membership, setMembership] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
        
        // Get membership
        const memberships = await base44.entities.SchoolMembership.filter({
          school_id: schoolId,
          user_email: currentUser.email
        });
        
        if (memberships.length === 0 || !isSchoolAdmin(memberships[0].role)) {
          toast.error('School admin access required');
          return;
        }
        
        setMembership(memberships[0]);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: staff = [] } = useQuery({
    queryKey: ['staff', activeSchoolId],
    queryFn: () => scopedFilter('SchoolMembership', activeSchoolId, {}, '-created_date', 100),
    enabled: !!activeSchoolId
  });

  const { data: invites = [] } = useQuery({
    queryKey: ['staff-invites', activeSchoolId],
    queryFn: () => scopedFilter('StaffInvite', activeSchoolId, { 
      status: 'PENDING' 
    }, '-created_date', 50),
    enabled: !!activeSchoolId
  });

  const createInviteMutation = useMutation({
    mutationFn: async (data) => {
      const token = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry
      
      return scopedCreate('StaffInvite', activeSchoolId, {
        email: data.email,
        role: data.role,
        invited_by_email: user.email,
        token,
        expires_at: expiresAt.toISOString()
      });
    },
    onSuccess: (invite) => {
      queryClient.invalidateQueries(['staff-invites']);
      toast.success('Invite sent!');
      setShowInviteForm(false);
      
      // Log action
      base44.entities.AuditLog.create({
        school_id: activeSchoolId,
        user_email: user.email,
        action: 'STAFF_INVITED',
        entity_type: 'StaffInvite',
        entity_id: invite.id,
        metadata: { invited_email: invite.email, role: invite.role }
      }).catch(() => {});
    }
  });

  const revokeInviteMutation = useMutation({
    mutationFn: async (inviteId) => {
      await base44.entities.StaffInvite.update(inviteId, {
        status: 'REVOKED'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-invites']);
      toast.success('Invite revoked');
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (membershipId) => {
      await base44.entities.SchoolMembership.delete(membershipId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      toast.success('Member removed');
      
      // Log action
      base44.entities.AuditLog.create({
        school_id: activeSchoolId,
        user_email: user.email,
        action: 'STAFF_REMOVED',
        entity_type: 'SchoolMembership',
        entity_id: membershipId
      }).catch(() => {});
    }
  });

  const copyInviteLink = (invite) => {
    const link = `${window.location.origin}/InviteAccept?token=${invite.token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied!');
  };

  if (!membership || !isSchoolAdmin(membership.role)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Card>
          <CardContent className="p-12">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-slate-600">This page is only accessible to school administrators</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">School Staff</h1>
          <p className="text-slate-600">Manage team members and invitations</p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Staff
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Invite New Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                createInviteMutation.mutate({
                  email: formData.get('email'),
                  role: formData.get('role')
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select name="role" defaultValue="STUDENT" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="INSTRUCTOR">Rabbi/Instructor</SelectItem>
                    <SelectItem value="TA">Teaching Assistant</SelectItem>
                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={createInviteMutation.isPending}>
                  Send Invite
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowInviteForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Invites */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{invite.role}</Badge>
                      <span className="text-xs text-slate-500">
                        Expires {new Date(invite.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => copyInviteLink(invite)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => revokeInviteMutation.mutate(invite.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Staff */}
      <Card>
        <CardHeader>
          <CardTitle>Current Team ({staff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{member.user_email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge>{member.role}</Badge>
                    {member.title_label && (
                      <span className="text-xs text-slate-600">{member.title_label}</span>
                    )}
                  </div>
                </div>
                {member.role !== 'OWNER' && member.user_email !== user.email && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Remove ${member.user_email} from school?`)) {
                        removeMemberMutation.mutate(member.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}