import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Flame, Target } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Leaderboard() {
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

  const { data: leaders = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => base44.entities.Leaderboard.list('-total_points', 50)
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <Award className="w-5 h-5 text-slate-400" />;
  };

  const myRank = leaders.findIndex(l => l.user_email === user?.email) + 1;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-amber-900 via-yellow-900 to-amber-900 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Trophy className="w-16 h-16" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
              <p className="text-amber-200 text-lg">Compete with top learners worldwide</p>
            </div>
          </div>
          {myRank > 0 && (
            <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center">
              <p className="text-sm text-amber-200 mb-1">Your Rank</p>
              <p className="text-5xl font-bold">#{myRank}</p>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <div className="space-y-3">
            {leaders.map((leader, idx) => (
              <Card key={leader.id} className={leader.user_email === user?.email ? 'border-amber-500 border-2' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center">
                        {getRankIcon(idx + 1)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{leader.user_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                          <span className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {leader.courses_completed} courses
                          </span>
                          <span className="flex items-center">
                            <Flame className="w-4 h-4 mr-1 text-orange-500" />
                            {leader.streak_days} day streak
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600">{leader.total_points.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}