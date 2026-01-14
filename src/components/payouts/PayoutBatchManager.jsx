import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { scopedFilter } from '../api/scoped';

export default function PayoutBatchManager({ schoolId, user }) {
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const queryClient = useQueryClient();

  const { data: batches = [] } = useQuery({
    queryKey: ['payout-batches', schoolId],
    queryFn: () => scopedFilter('PayoutBatch', schoolId, {}, '-created_date'),
    enabled: !!schoolId
  });

  const { data: pendingReferrals = [] } = useQuery({
    queryKey: ['pending-referrals', schoolId],
    queryFn: () => scopedFilter('Referral', schoolId, { 
      status: 'completed'
    }),
    enabled: !!schoolId
  });

  const createBatchMutation = useMutation({
    mutationFn: async () => {
      if (!periodStart || !periodEnd) {
        throw new Error('Please select date range');
      }
      
      // Get unbatched referrals in date range
      const eligible = pendingReferrals.filter(r => {
        const created = new Date(r.created_date);
        return created >= new Date(periodStart) && created <= new Date(periodEnd) &&
               !r.payout_batch_id;
      });
      
      if (eligible.length === 0) {
        throw new Error('No eligible commissions in date range');
      }
      
      const totalAmount = eligible.reduce((sum, r) => sum + (r.commission_cents || 0), 0);
      
      // Create batch
      const batch = await base44.entities.PayoutBatch.create({
        school_id: schoolId,
        batch_name: `${periodStart} to ${periodEnd}`,
        period_start: periodStart,
        period_end: periodEnd,
        total_amount_cents: totalAmount,
        payout_count: eligible.length,
        status: 'PENDING'
      });
      
      // Assign referrals to batch
      for (const ref of eligible) {
        await base44.entities.Referral.update(ref.id, {
          payout_batch_id: batch.id,
          status: 'batched'
        });
      }
      
      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payout-batches']);
      queryClient.invalidateQueries(['pending-referrals']);
      toast.success('Payout batch created');
      setPeriodStart('');
      setPeriodEnd('');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const exportBatch = async (batch) => {
    const referrals = await base44.entities.Referral.filter({
      school_id: schoolId,
      payout_batch_id: batch.id
    });
    
    const affiliates = await base44.entities.Affiliate.filter({ school_id: schoolId });
    
    const csv = [
      ['Affiliate Code', 'Email', 'Referrals', 'Commission', 'Status'],
      ...referrals.reduce((rows, ref) => {
        const affiliate = affiliates.find(a => a.id === ref.affiliate_id);
        if (!affiliate) return rows;
        
        const existing = rows.find(r => r[0] === affiliate.code);
        if (existing) {
          existing[2] += 1;
          existing[3] += ref.commission_cents;
        } else {
          rows.push([
            affiliate.code,
            affiliate.user_email,
            1,
            ref.commission_cents,
            ref.status
          ]);
        }
        return rows;
      }, [])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout-batch-${batch.batch_name}.csv`;
    a.click();
    toast.success('CSV exported');
  };

  const markPaidMutation = useMutation({
    mutationFn: async (batchId) => {
      await base44.entities.PayoutBatch.update(batchId, {
        status: 'COMPLETED',
        processed_by_user: user.email,
        processed_at: new Date().toISOString()
      });
      
      // Mark referrals as paid
      const referrals = await base44.entities.Referral.filter({
        payout_batch_id: batchId
      });
      
      for (const ref of referrals) {
        await base44.entities.Referral.update(ref.id, {
          status: 'paid'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payout-batches']);
      toast.success('Batch marked as paid');
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Payout Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Period Start</Label>
              <Input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Period End</Label>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={() => createBatchMutation.mutate()}
            disabled={createBatchMutation.isPending || !periodStart || !periodEnd}
          >
            Create Batch ({pendingReferrals.filter(r => !r.payout_batch_id).length} eligible)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {batches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{batch.batch_name}</p>
                  <p className="text-sm text-slate-600">
                    {batch.payout_count} payouts • ${(batch.total_amount_cents / 100).toFixed(2)}
                  </p>
                  <Badge className="mt-1" variant={
                    batch.status === 'COMPLETED' ? 'default' : 'secondary'
                  }>
                    {batch.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => exportBatch(batch)}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  {batch.status !== 'COMPLETED' && (
                    <Button 
                      size="sm" 
                      onClick={() => markPaidMutation.mutate(batch.id)}
                      disabled={markPaidMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Paid
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {batches.length === 0 && (
              <p className="text-slate-500 text-center py-8">No payout batches yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}