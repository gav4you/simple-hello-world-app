import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Flame } from 'lucide-react';
import { toast } from 'sonner';

export default function HabitTracker() {
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

  const { data: habits = [] } = useQuery({
    queryKey: ['habits', user?.email],
    queryFn: () => base44.entities.Habit.filter({ user_email: user.email, is_active: true }),
    enabled: !!user?.email
  });

  const checkInMutation = useMutation({
    mutationFn: async (habit) => {
      const today = new Date().toISOString().split('T')[0];
      const history = habit.completion_history || [];
      const updated = [...history, { date: today, completed: true, value: habit.target_value }];
      return await base44.entities.Habit.update(habit.id, {
        completion_history: updated,
        current_streak: (habit.current_streak || 0) + 1,
        longest_streak: Math.max((habit.longest_streak || 0), (habit.current_streak || 0) + 1)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['habits']);
      toast.success('Habit checked in! 🎉');
    }
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-900 to-red-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Flame className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Habit Tracker</h1>
            <p className="text-orange-200 text-lg">Build consistent learning habits</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map((habit) => (
          <Card key={habit.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{habit.title}</h3>
                  <p className="text-sm text-slate-600">{habit.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <span className="text-2xl font-bold">{habit.current_streak}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-600">Target: {habit.target_value} {habit.goal_type.replace('_', ' ')}</span>
                <span className="text-sm text-slate-600">Best: {habit.longest_streak} days</span>
              </div>
              <Button onClick={() => checkInMutation.mutate(habit)} className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Check In Today
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}