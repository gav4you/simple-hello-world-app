import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Challenges() {
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

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list('-created_date')
  });

  const joinMutation = useMutation({
    mutationFn: async (challenge) => {
      const participants = challenge.participants || [];
      return await base44.entities.Challenge.update(challenge.id, {
        participants: [...participants, user.email]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenges']);
      toast.success('Challenge joined!');
    }
  });

  const isJoined = (challenge) => challenge.participants?.includes(user?.email);
  const isCompleted = (challenge) => challenge.completions?.includes(user?.email);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Target className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Daily Challenges</h1>
            <p className="text-purple-200 text-lg">Complete challenges to earn bonus points</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Badge className={challenge.type === 'daily' ? 'bg-purple-600' : 'bg-blue-600'}>
                  {challenge.type}
                </Badge>
                {isCompleted(challenge) && (
                  <Badge className="bg-green-600 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Completed</span>
                  </Badge>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{challenge.title}</h3>
              <p className="text-slate-600 mb-4">{challenge.description}</p>

              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Goal: {challenge.goal?.target} {challenge.goal?.type}</span>
                  <span className="flex items-center text-amber-600 font-bold">
                    <Zap className="w-4 h-4 mr-1" />
                    {challenge.reward_points} pts
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  {challenge.participants?.length || 0} participants
                </span>
                <Button
                  onClick={() => joinMutation.mutate(challenge)}
                  disabled={isJoined(challenge) || isCompleted(challenge)}
                  variant={isCompleted(challenge) ? 'outline' : 'default'}
                >
                  {isCompleted(challenge) ? 'Completed' : isJoined(challenge) ? 'Joined' : 'Join Challenge'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}