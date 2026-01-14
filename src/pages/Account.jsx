import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, CreditCard, Award, Users } from 'lucide-react';
import { toast } from 'sonner';
import { scopedFilter } from '../components/api/scoped';
import { isSubscriptionActive } from '../components/subscriptions/subscriptionEngine';
import { isEntitlementActive } from '@/components/utils/entitlements';

export default function Account() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setActiveSchoolId(localStorage.getItem('active_school_id'));
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: transactions = [] } = useQuery({
    queryKey: ['my-transactions', user?.email, activeSchoolId],
    queryFn: () => scopedFilter('Transaction', activeSchoolId, {
      user_email: user.email
    }, '-created_date'),
    enabled: !!user && !!activeSchoolId
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['my-subscriptions', user?.email, activeSchoolId],
    queryFn: () => scopedFilter('Subscription', activeSchoolId, {
      user_email: user.email
    }, '-created_date'),
    enabled: !!user && !!activeSchoolId
  });

  const { data: entitlements = [] } = useQuery({
    queryKey: ['my-entitlements', user?.email, activeSchoolId],
    queryFn: () => scopedFilter('Entitlement', activeSchoolId, {
      user_email: user.email
    }),
    enabled: !!user && !!activeSchoolId
  });

  const { data: affiliate } = useQuery({
    queryKey: ['my-affiliate', user?.email, activeSchoolId],
    queryFn: async () => {
      const affs = await scopedFilter('Affiliate', activeSchoolId, {
        user_email: user.email
      });
      return affs[0];
    },
    enabled: !!user && !!activeSchoolId
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subId) => {
      await base44.entities.Subscription.update(subId, {
        status: 'cancelled',
        canceled_at: new Date().toISOString(),
        auto_renew: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-subscriptions']);
      toast.success('Subscription canceled. Access remains until end of period.');
    }
  });

  const copyLicenses = entitlements.filter(e => 
    e.type === 'COPY_LICENSE' || e.type === 'DOWNLOAD_LICENSE'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-slate-600">Manage your purchases, subscriptions, and licenses</p>
      </div>

      <Tabs defaultValue="purchases">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="purchases">
            <CreditCard className="w-4 h-4 mr-2" />
            Purchases
          </TabsTrigger>
          <TabsTrigger value="subscriptions">
            <CreditCard className="w-4 h-4 mr-2" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="licenses">
            <Award className="w-4 h-4 mr-2" />
            Licenses
          </TabsTrigger>
          {affiliate && (
            <TabsTrigger value="referrals">
              <Users className="w-4 h-4 mr-2" />
              Referrals
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <p className="font-medium">Order #{txn.id.substring(0, 8)}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(txn.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(txn.amount_cents / 100).toFixed(2)}</p>
                      <Badge variant={txn.status === 'completed' ? 'default' : 'secondary'}>
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-slate-500 text-center py-8">No purchases yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscriptions.map((sub) => {
                  const isActive = isSubscriptionActive(sub);
                  return (
                    <div key={sub.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge className={isActive ? 'bg-green-500' : 'bg-slate-500'}>
                            {sub.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(sub.price_paid / 100).toFixed(2)}/period</p>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>Started: {new Date(sub.start_date).toLocaleDateString()}</p>
                        {sub.current_period_end && (
                          <p>Renews: {new Date(sub.current_period_end).toLocaleDateString()}</p>
                        )}
                      </div>
                      {isActive && sub.status !== 'cancelled' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-3"
                          onClick={() => cancelSubscriptionMutation.mutate(sub.id)}
                          disabled={cancelSubscriptionMutation.isPending}
                        >
                          Cancel at Period End
                        </Button>
                      )}
                    </div>
                  );
                })}
                {subscriptions.length === 0 && (
                  <p className="text-slate-500 text-center py-8">No active subscriptions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses">
          <Card>
            <CardHeader>
              <CardTitle>Active Licenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {copyLicenses.map((lic) => {
                  const active = isEntitlementActive(lic);
                  
                  return (
                    <div key={lic.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <p className="font-semibold">{lic.type === 'COPY_LICENSE' ? 'Copy License' : 'Download License'}</p>
                        <p className="text-sm text-slate-600">
                          {lic.ends_at ? `${active ? 'Expires' : 'Expired'} ${new Date(lic.ends_at).toLocaleDateString()}` : 'Lifetime'}
                        </p>
                      </div>
                      <Badge variant={active ? 'default' : 'secondary'}>
                        {active ? 'Active' : 'Expired'}
                      </Badge>
                    </div>
                  );
                })}
                {copyLicenses.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-3">No licenses purchased</p>
                    <p className="text-xs text-slate-400">Licenses unlock copy/download rights for owned courses</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {affiliate && (
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800">
                    Total Earnings: <span className="font-bold text-lg">${(affiliate.total_earnings_cents / 100).toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {affiliate.total_referrals} successful referrals
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Earnings are processed in monthly batches and paid out by school administration
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}