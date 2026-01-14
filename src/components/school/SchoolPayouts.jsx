import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolPayouts({ school, user }) {
  const [showDialog, setShowDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: payouts = [] } = useQuery({
    queryKey: ['all-payouts', school.id],
    queryFn: () => base44.entities.InstructorPayout.filter({ school_id: school.id }, '-created_date'),
    enabled: !!school
  });

  const createPayoutMutation = useMutation({
    mutationFn: (data) => base44.entities.InstructorPayout.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-payouts']);
      setShowDialog(false);
      toast.success('Payout created');
    }
  });

  const markPaidMutation = useMutation({
    mutationFn: (id) => base44.entities.InstructorPayout.update(id, {
      status: 'PAID',
      paid_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-payouts']);
      toast.success('Payout marked as paid');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    createPayoutMutation.mutate({
      school_id: school.id,
      instructor_email: formData.get('instructor_email'),
      amount_cents: Math.round(parseFloat(formData.get('amount')) * 100),
      period_start: formData.get('period_start'),
      period_end: formData.get('period_end'),
      notes: formData.get('notes'),
      created_by_user: user.email
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Instructor Payouts
        </CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>Create Payout</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Instructor Payout</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Instructor Email</Label>
                <Input name="instructor_email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input name="amount" type="number" step="0.01" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Period Start</Label>
                  <Input name="period_start" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>Period End</Label>
                  <Input name="period_end" type="date" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input name="notes" placeholder="Optional notes" />
              </div>
              <Button type="submit" className="w-full">Create Payout</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Instructor</th>
                <th className="text-left py-3 px-4">Period</th>
                <th className="text-right py-3 px-4">Amount</th>
                <th className="text-right py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b hover:bg-slate-50">
                  <td className="py-3 px-4">{payout.instructor_email}</td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(payout.period_start).toLocaleDateString()} -{' '}
                    {new Date(payout.period_end).toLocaleDateString()}
                  </td>
                  <td className="text-right py-3 px-4 font-medium">
                    ${(payout.amount_cents / 100).toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-4">
                    <Badge variant={payout.status === 'PAID' ? 'default' : 'secondary'}>
                      {payout.status}
                    </Badge>
                  </td>
                  <td className="text-right py-3 px-4">
                    {payout.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markPaidMutation.mutate(payout.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payouts.length === 0 && (
            <p className="text-slate-500 text-center py-8">No payouts yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}