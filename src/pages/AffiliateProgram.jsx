import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, Users, Link as LinkIcon, Copy, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AffiliateProgram() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: affiliate } = useQuery({
    queryKey: ['affiliate', user?.email],
    queryFn: async () => {
      const affs = await base44.entities.Affiliate.filter({ user_email: user.email });
      return affs[0];
    },
    enabled: !!user?.email
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ affiliate_email: user.email }),
    enabled: !!user?.email
  });

  const joinProgramMutation = useMutation({
    mutationFn: async () => {
      const code = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      return await base44.entities.Affiliate.create({
        user_email: user.email,
        referral_code: code,
        commission_rate: 20,
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['affiliate']);
      toast.success('Welcome to the affiliate program!');
    }
  });

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${affiliate.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  if (!affiliate) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Affiliate Program</h1>
          <p className="text-green-200 text-lg">Earn 20% commission by sharing Breslov Academy</p>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Join Our Affiliate Program</h2>
            <p className="text-slate-600 mb-6 max-w-xl mx-auto">
              Share the gift of Torah learning and earn 20% commission on every subscription you refer. 
              Help others discover the teachings of Rebbe Nachman while generating income.
            </p>
            <Button
              onClick={() => joinProgramMutation.mutate()}
              className="bg-green-600 hover:bg-green-700"
              disabled={joinProgramMutation.isPending}
            >
              Join Affiliate Program
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Affiliate Dashboard</h1>
        <p className="text-green-200">Track your referrals and earnings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  ${affiliate.total_earnings || 0}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  ${affiliate.pending_earnings || 0}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Referrals</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {referrals.length}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Converted</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {referrals.filter(r => r.status === 'converted').length}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              value={`${window.location.origin}?ref=${affiliate.referral_code}`}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyReferralLink}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          <p className="text-sm text-slate-600 mt-3">
            Share this link and earn {affiliate.commission_rate}% commission on all subscriptions
          </p>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No referrals yet. Start sharing your link!</p>
          ) : (
            <div className="space-y-3">
              {referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{ref.referred_email}</p>
                    <p className="text-sm text-slate-600">
                      {ref.status === 'converted' ? 'Subscribed' : 'Pending'} • 
                      {ref.conversion_date && ` ${new Date(ref.conversion_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${ref.commission_amount || 0}</p>
                    <p className="text-xs text-slate-500">{ref.subscription_tier}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}