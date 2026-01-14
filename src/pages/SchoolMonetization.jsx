import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DollarSign, Tag, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { createEntitlementsForPurchase, processReferral, recordCouponRedemption } from '../components/utils/entitlements';
import ConversionFunnel from '../components/analytics/ConversionFunnel';
import RevenueChart from '../components/analytics/RevenueChart';
import PayoutBatchManager from '../components/payouts/PayoutBatchManager';
import { createPageUrl } from '@/utils';
import VirtualizedList from '@/components/system/VirtualizedList';

export default function SchoolMonetization() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
        
        // RBAC: Require school admin
        const memberships = await base44.entities.SchoolMembership.filter({
          school_id: schoolId,
          user_email: currentUser.email
        });
        
        if (memberships.length > 0) {
          const { isSchoolAdmin } = await import('../components/auth/roles');
          if (!isSchoolAdmin(memberships[0].role)) {
            toast.error('School admin access required');
            window.location.href = createPageUrl('Dashboard');
          }
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: offers = [] } = useQuery({
    queryKey: ['offers', activeSchoolId],
    queryFn: () => base44.entities.Offer.filter({ school_id: activeSchoolId }),
    enabled: !!activeSchoolId
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons', activeSchoolId],
    queryFn: () => base44.entities.Coupon.filter({ school_id: activeSchoolId }),
    enabled: !!activeSchoolId
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', activeSchoolId],
    queryFn: () => base44.entities.Transaction.filter({ school_id: activeSchoolId }, '-created_date', 100),
    enabled: !!activeSchoolId
  });

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount_cents || 0), 0);

  const pendingTransactions = transactions.filter(t => t.status === 'pending');

  const approveMutation = useMutation({
    mutationFn: async (transactionId) => {
      const transaction = transactions.find(t => t.id === transactionId);
      const offer = offers.find(o => o.id === transaction.offer_id);

      // Update transaction
      await base44.entities.Transaction.update(transactionId, {
        status: 'completed'
      });

      // Grant entitlements using helper (idempotent)
      if (offer) {
        const entResult = await createEntitlementsForPurchase(transaction, offer, activeSchoolId);

        // Process referral commission (idempotent)
        const refResult = await processReferral(transaction, activeSchoolId);

        // Record coupon redemption if applicable (idempotent)
        if (transaction.coupon_code) {
          const coupons = await base44.entities.Coupon.filter({
            school_id: activeSchoolId,
            code: transaction.coupon_code
          });
          if (coupons[0]) {
            const { recordCouponRedemption } = await import('../components/utils/entitlements');
            await recordCouponRedemption({
              school_id: activeSchoolId,
              coupon: coupons[0],
              transaction,
              user_email: transaction.user_email
            });
          }
        }

        console.log('Approval result:', { entitlements: entResult, referral: refResult });
      }

      // Log event
      await base44.entities.AuditLog.create({
        school_id: activeSchoolId,
        user_email: user.email,
        action: 'APPROVE_TRANSACTION',
        entity_type: 'Transaction',
        entity_id: transactionId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      toast.success('Transaction approved and access granted');
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Monetization Dashboard</h1>
        <p className="text-slate-600">Manage offers, transactions, and revenue</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${(totalRevenue / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{offers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{transactions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{pendingTransactions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <VirtualizedList
                items={transactions}
                initialCount={24}
                chunkSize={24}
                className="space-y-3"
                getKey={(t) => t.id}
                empty={<p className="text-slate-500 text-center py-8">No transactions yet</p>}
                renderItem={(transaction) => (
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{transaction.user_email}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(transaction.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex items-center space-x-3">
                      <div>
                        <p className="font-semibold">${(transaction.amount_cents / 100).toFixed(2)}</p>
                        <Badge
                          variant={
                            transaction.status === 'completed'
                              ? 'default'
                              : transaction.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      {transaction.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(transaction.id)}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div key={offer.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold">{offer.name}</h4>
                        <p className="text-sm text-slate-600">{offer.description}</p>
                      </div>
                      <Badge>{offer.offer_type}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-semibold">
                        ${(offer.price_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                {offers.length === 0 && (
                  <p className="text-slate-500 text-center py-8">No offers created yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-mono font-bold">{coupon.code}</p>
                      <p className="text-xs text-slate-500">
                        {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`} off
                      </p>
                    </div>
                    <Badge variant="outline">
                      Used: {coupon.usage_count || 0}/{coupon.usage_limit || '∞'}
                    </Badge>
                  </div>
                ))}
                {coupons.length === 0 && (
                  <p className="text-slate-500 text-center py-8">No coupons created yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutBatchManager schoolId={activeSchoolId} user={user} />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <RevenueChart schoolId={activeSchoolId} />
            <ConversionFunnel schoolId={activeSchoolId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}