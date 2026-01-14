import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, TrendingUp, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function Affiliate() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [affiliateCode, setAffiliateCode] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: affiliate } = useQuery({
    queryKey: ['affiliate', user?.email, activeSchoolId],
    queryFn: async () => {
      const affiliates = await base44.entities.Affiliate.filter({
        school_id: activeSchoolId,
        user_email: user.email
      });
      
      if (affiliates[0]) {
        setAffiliateCode(affiliates[0].code);
        return affiliates[0];
      }
      
      // Create affiliate record
      const code = `${user.email.split('@')[0]}-${Math.random().toString(36).substring(7)}`.toUpperCase();
      const newAffiliate = await base44.entities.Affiliate.create({
        school_id: activeSchoolId,
        user_email: user.email,
        code,
        commission_rate: 10
      });
      setAffiliateCode(code);
      return newAffiliate;
    },
    enabled: !!user && !!activeSchoolId
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', affiliate?.id],
    queryFn: () => base44.entities.Referral.filter({
      school_id: activeSchoolId,
      affiliate_id: affiliate.id
    }),
    enabled: !!affiliate
  });

  const totalEarnings = referrals
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (r.commission_cents || 0), 0);

  const { data: school } = useQuery({
    queryKey: ['active-school', activeSchoolId],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ id: activeSchoolId });
      return schools[0];
    },
    enabled: !!activeSchoolId
  });

  const copyAffiliateLink = () => {
    const slug = school?.slug || 'school';
    const link = `${window.location.origin}${createPageUrl('SchoolLanding')}?slug=${slug}&ref=${affiliateCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Affiliate link copied!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Affiliate Program</h1>
        <p className="text-slate-600">Earn commissions by referring students</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${(totalEarnings / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{referrals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Commission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{affiliate?.commission_rate || 10}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Affiliate Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input 
              value={school ? `${window.location.origin}${createPageUrl('SchoolLanding')}?slug=${school.slug}&ref=${affiliateCode}` : 'Loading...'} 
              readOnly 
            />
            <Button onClick={copyAffiliateLink} disabled={!school}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Share this link to earn {affiliate?.commission_rate || 10}% commission on all purchases
          </p>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{referral.referred_email}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(referral.created_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                    {referral.status}
                  </Badge>
                  {referral.commission_cents > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      +${(referral.commission_cents / 100).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {referrals.length === 0 && (
              <p className="text-slate-500 text-center py-8">No referrals yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}