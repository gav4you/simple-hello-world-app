import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function TeachCoursePricing({ course, schoolId }) {
  const queryClient = useQueryClient();

  const { data: offers = [] } = useQuery({
    queryKey: ['school-offers', schoolId],
    queryFn: () => base44.entities.Offer.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.update(course.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['course']);
      toast.success('Pricing updated!');
    }
  });

  const handleAccessLevelChange = (value) => {
    updateCourseMutation.mutate({ access_level: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Pricing & Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Access Level</Label>
          <Select 
            value={course.access_level || 'FREE'} 
            onValueChange={handleAccessLevelChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">Free - All school members</SelectItem>
              <SelectItem value="PAID">Paid - Requires purchase or subscription</SelectItem>
              <SelectItem value="PRIVATE">Private - Admin grant only</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-slate-500">
            {course.access_level === 'FREE' && 'All members of this school can access this course'}
            {course.access_level === 'PAID' && 'Students need to purchase or subscribe to access'}
            {course.access_level === 'PRIVATE' && 'Only students you grant access can see this course'}
          </p>
        </div>

        {course.access_level === 'PAID' && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold">Required Offers</h4>
            <p className="text-sm text-slate-600">
              To manage offers and bundles, go to School Admin → Monetization
            </p>
            {offers.length > 0 ? (
              <div className="space-y-2">
                {offers.map((offer) => (
                  <div key={offer.id} className="p-3 bg-white border rounded">
                    <p className="font-medium">{offer.name}</p>
                    <p className="text-sm text-slate-600">
                      ${(offer.price_cents / 100).toFixed(2)} 
                      {offer.billing_interval && ` / ${offer.billing_interval}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No offers configured yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}