import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/components/hooks/useSession';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function extractToken(input) {
  const raw = (input || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const t = url.searchParams.get('token') || url.searchParams.get('invite') || '';
    return t || raw;
  } catch (_) {
    // not a URL
    const m = raw.match(/(?:token|invite)=([^&]+)/i);
    if (m?.[1]) return decodeURIComponent(m[1]);
    return raw;
  }
}

/**
 * App-side onboarding gateway:
 * - For authenticated users with 0 memberships
 * - Lets them accept an invite or create a school
 */
export default function OnboardingHub() {
  const { user, memberships, isLoading } = useSession();
  const navigate = useNavigate();
  const [inviteInput, setInviteInput] = useState('');

  const token = useMemo(() => extractToken(inviteInput), [inviteInput]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (memberships?.length > 0) {
    // If user somehow lands here after gaining a membership, kick them back.
    navigate('/app', { replace: true });
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome{user?.email ? `, ${user.email}` : ''}</CardTitle>
          <CardDescription>
            You’re signed in, but you don’t belong to a school yet. Join with an invite or create a new school.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8">
          <div className="grid gap-3">
            <div className="text-sm font-medium">Join a school</div>
            <div className="text-sm text-muted-foreground">
              Paste an invite link or token. We’ll route you to the invite acceptance screen.
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                placeholder="Invite link or token (e.g. https://.../InviteAccept?token=abc123)"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
              />
              <Button
                className="sm:w-40"
                disabled={!token}
                onClick={() => navigate(`/app/InviteAccept?token=${encodeURIComponent(token)}`)}
              >
                Accept Invite
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="text-sm font-medium">Create a school</div>
            <div className="text-sm text-muted-foreground">
              For teachers/admins setting up a new storefront and courses.
            </div>
            <Button onClick={() => navigate('/app/SchoolNew')}>Create School</Button>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground">
            <div>Not sure where to start?</div>
            <div>
              If you have a storefront link, you can browse as a guest at{' '}
              <a className="underline" href="/s/demo">/s/&lt;school&gt;</a>.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
