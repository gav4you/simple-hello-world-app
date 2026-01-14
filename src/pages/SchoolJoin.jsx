import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SchoolJoin() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [school, setSchool] = useState(null);
  const [invite, setInvite] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    processInvite();
  }, []);

  const processInvite = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Get token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        return;
      }

      // Find invite
      const invites = await base44.entities.SchoolInvite.filter({ token });
      if (invites.length === 0) {
        setStatus('invalid');
        return;
      }

      const foundInvite = invites[0];
      setInvite(foundInvite);

      // Check if already accepted
      if (foundInvite.accepted_at) {
        setStatus('already_accepted');
        return;
      }

      // Check if expired
      if (new Date(foundInvite.expires_at) < new Date()) {
        setStatus('expired');
        return;
      }

      // Check if email matches
      if (foundInvite.email !== currentUser.email) {
        setStatus('wrong_email');
        return;
      }

      // Load school
      const schools = await base44.entities.School.filter({ id: foundInvite.school_id });
      if (schools.length === 0) {
        setStatus('school_not_found');
        return;
      }
      setSchool(schools[0]);

      // Check if already a member
      const existingMemberships = await base44.entities.SchoolMembership.filter({
        school_id: foundInvite.school_id,
        user_email: currentUser.email
      });

      if (existingMemberships.length > 0) {
        setStatus('already_member');
        return;
      }

      setStatus('ready');
    } catch (error) {
      console.error('Error processing invite:', error);
      setStatus('error');
    }
  };

  const handleAcceptInvite = async () => {
    setStatus('accepting');

    try {
      // Create membership
      await base44.entities.SchoolMembership.create({
        school_id: invite.school_id,
        user_email: user.email,
        role: invite.role,
        joined_at: new Date().toISOString()
      });

      // Mark invite as accepted
      await base44.entities.SchoolInvite.update(invite.id, {
        accepted_at: new Date().toISOString()
      });

      // Set as active school
      const prefs = await base44.entities.UserSchoolPreference.filter({
        user_email: user.email
      });

      if (prefs.length > 0) {
        await base44.entities.UserSchoolPreference.update(prefs[0].id, {
          active_school_id: invite.school_id,
          updated_at: new Date().toISOString()
        });
      } else {
        await base44.entities.UserSchoolPreference.create({
          user_email: user.email,
          active_school_id: invite.school_id,
          updated_at: new Date().toISOString()
        });
      }

      localStorage.setItem('active_school_id', invite.school_id);
      setStatus('success');

      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error accepting invite:', error);
      setStatus('error');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Validating invitation...</p>
          </div>
        );

      case 'ready':
        return (
          <div className="space-y-6">
            <div className="text-center">
              {school.logo_url ? (
                <img src={school.logo_url} alt={school.name} className="w-20 h-20 mx-auto mb-4 rounded-lg" />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{school.name}</h2>
              <p className="text-slate-600">{school.description}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                You've been invited to join as <strong>{invite.role}</strong>
              </p>
            </div>

            <Button onClick={handleAcceptInvite} className="w-full">
              Accept Invitation
            </Button>
          </div>
        );

      case 'accepting':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Joining school...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome!</h2>
            <p className="text-slate-600">You've successfully joined {school?.name}</p>
            <p className="text-sm text-slate-500 mt-2">Redirecting to dashboard...</p>
          </div>
        );

      case 'already_member':
        return (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Already a Member</h2>
            <p className="text-slate-600">You're already a member of this school</p>
            <Button onClick={() => navigate(createPageUrl('Dashboard'))} className="mt-4">
              Go to Dashboard
            </Button>
          </div>
        );

      case 'expired':
      case 'invalid':
      case 'wrong_email':
      case 'school_not_found':
      case 'error':
        return (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Invitation</h2>
            <p className="text-slate-600">
              {status === 'expired' && 'This invitation has expired'}
              {status === 'invalid' && 'This invitation is invalid'}
              {status === 'wrong_email' && 'This invitation is for a different email address'}
              {status === 'school_not_found' && 'School not found'}
              {status === 'error' && 'An error occurred'}
            </p>
            <Button onClick={() => navigate(createPageUrl('Dashboard'))} className="mt-4" variant="outline">
              Go to Dashboard
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>School Invitation</CardTitle>
          <CardDescription>Join a Torah learning community</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}