import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function StudyBuddies() {
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

  const { data: buddies = [] } = useQuery({
    queryKey: ['study-buddies', user?.email],
    queryFn: async () => {
      const b1 = await base44.entities.StudyBuddy.filter({ user1_email: user.email });
      const b2 = await base44.entities.StudyBuddy.filter({ user2_email: user.email });
      return [...b1, ...b2];
    },
    enabled: !!user?.email
  });

  const acceptMutation = useMutation({
    mutationFn: (buddy) => base44.entities.StudyBuddy.update(buddy.id, { status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['study-buddies']);
      toast.success('Study buddy accepted!');
    }
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-pink-900 to-purple-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Users className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Study Buddies</h1>
            <p className="text-pink-200 text-lg">Learn together, achieve more</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buddies.map((buddy) => {
          const partnerEmail = buddy.user1_email === user?.email ? buddy.user2_email : buddy.user1_email;
          return (
            <Card key={buddy.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {partnerEmail[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold">{partnerEmail}</h3>
                      <Badge variant={buddy.status === 'active' ? 'default' : 'secondary'}>
                        {buddy.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Match Score</p>
                    <p className="text-2xl font-bold text-purple-600">{buddy.match_score}%</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-600">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {buddy.total_sessions} study sessions completed
                  </p>
                </div>
                {buddy.status === 'pending' && buddy.user2_email === user?.email && (
                  <Button onClick={() => acceptMutation.mutate(buddy)} className="w-full">
                    Accept Request
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}