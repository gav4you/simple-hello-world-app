import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import StudentDashboard from '../components/analytics/StudentDashboard';

export default function Analytics() {
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

  const { data: analytics = [] } = useQuery({
    queryKey: ['analytics', user?.email],
    queryFn: () => base44.entities.Analytics.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ is_published: true })
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Learning Analytics</h1>
            <p className="text-slate-300 text-lg mt-1">Track your progress and insights</p>
          </div>
        </div>
      </div>

      <StudentDashboard analytics={analytics} progress={progress} courses={courses} />
    </div>
  );
}