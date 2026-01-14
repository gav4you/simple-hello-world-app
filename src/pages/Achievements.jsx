import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, Target, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AchievementBadge from '../components/gamification/AchievementBadge';

export default function Achievements() {
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

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }, '-earned_date'),
    enabled: !!user?.email
  });

  const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0);

  const allBadges = [
    { type: 'first_lesson', name: 'First Steps', description: 'Complete your first lesson', points: 10 },
    { type: 'first_course', name: 'Course Complete', description: 'Finish your first course', points: 50 },
    { type: 'streak_7', name: '7-Day Streak', description: 'Study for 7 days in a row', points: 30 },
    { type: 'streak_30', name: '30-Day Streak', description: 'Study for 30 days in a row', points: 100 },
    { type: 'streak_100', name: '100-Day Streak', description: 'Study for 100 days in a row', points: 500 },
    { type: 'complete_5_courses', name: 'Dedicated Scholar', description: 'Complete 5 courses', points: 200 },
    { type: 'complete_10_courses', name: 'Master Student', description: 'Complete 10 courses', points: 500 },
    { type: 'quiz_master', name: 'Quiz Master', description: 'Pass 10 quizzes with 100%', points: 150 },
    { type: 'perfect_score', name: 'Perfect Score', description: 'Get 100% on any quiz', points: 25 },
    { type: 'discussion_contributor', name: 'Discussion Leader', description: 'Post 20 discussions', points: 75 },
    { type: 'community_helper', name: 'Community Helper', description: 'Help others in 50 replies', points: 100 },
    { type: 'early_bird', name: 'Early Bird', description: 'Study before 6 AM', points: 20 },
    { type: 'night_owl', name: 'Night Owl', description: 'Study after 10 PM', points: 20 }
  ];

  const earnedBadges = achievements.map(a => a.badge_type);
  const locked = allBadges.filter(b => !earnedBadges.includes(b.type));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-orange-900 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Achievements</h1>
              <p className="text-amber-200 text-lg mt-1">
                Track your learning milestones
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white">{totalPoints}</div>
            <div className="text-amber-200">Total Points</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{achievements.length}</div>
            <div className="text-sm text-slate-600">Badges Earned</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{totalPoints}</div>
            <div className="text-sm text-slate-600">Total Points</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {Math.round((achievements.length / allBadges.length) * 100)}%
            </div>
            <div className="text-sm text-slate-600">Progress</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-900">7</div>
            <div className="text-sm text-slate-600">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Badges */}
      {achievements.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {achievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} size="md" />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Available Achievements ({locked.length} remaining)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {locked.map((badge) => (
            <Card key={badge.type} className="opacity-60 hover:opacity-80 transition-opacity">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-300 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-slate-500" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{badge.name}</h4>
                <p className="text-slate-600 text-xs line-clamp-2">{badge.description}</p>
                <div className="mt-2 text-xs text-slate-500">
                  +{badge.points} points
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}