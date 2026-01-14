import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, Users } from 'lucide-react';

export default function Scholarships() {
  const [user, setUser] = useState(null);

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

  const { data: scholarships = [] } = useQuery({
    queryKey: ['scholarships'],
    queryFn: () => base44.entities.Scholarship.list()
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <DollarSign className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Scholarships</h1>
            <p className="text-emerald-200 text-lg">Financial aid opportunities</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scholarships.map((scholarship) => (
          <Card key={scholarship.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{scholarship.name}</h3>
                  <Badge className={scholarship.status === 'open' ? 'bg-green-600' : 'bg-slate-400'}>
                    {scholarship.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">${scholarship.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Award Amount</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-4">{scholarship.description}</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center text-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Deadline: {new Date(scholarship.application_deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{scholarship.available_spots} spots available</span>
                </div>
              </div>
              <Button className="w-full" disabled={scholarship.status !== 'open'}>
                Apply Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}