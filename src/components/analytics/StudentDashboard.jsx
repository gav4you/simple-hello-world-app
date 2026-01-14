import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Target, Award, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function StudentDashboard({ analytics, progress, courses }) {
  // Calculate stats
  const totalStudyTime = analytics.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) / 3600; // hours
  const coursesInProgress = [...new Set(progress.filter(p => !p.completed).map(p => p.course_id))].length;
  const completedLessons = progress.filter(p => p.completed).length;
  
  // Weekly activity
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const weeklyActivity = last7Days.map(date => {
    const dayAnalytics = analytics.filter(a => a.date === date);
    const minutes = dayAnalytics.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) / 60;
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: Math.round(minutes)
    };
  });

  // Course progress by category
  const categoryProgress = courses.reduce((acc, course) => {
    const courseLessons = progress.filter(p => p.course_id === course.id);
    const category = course.category || 'other';
    
    if (!acc[category]) {
      acc[category] = { name: category.replace(/_/g, ' '), completed: 0, total: 0 };
    }
    
    acc[category].completed += courseLessons.filter(p => p.completed).length;
    acc[category].total += courseLessons.length;
    
    return acc;
  }, {});

  const categoryData = Object.values(categoryProgress);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Study Time</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {Math.round(totalStudyTime)}h
                </p>
              </div>
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Courses</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {coursesInProgress}
                </p>
              </div>
              <BookOpen className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Lessons Completed</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {completedLessons}
                </p>
              </div>
              <Target className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">This Week</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {weeklyActivity.reduce((sum, d) => sum + d.minutes, 0)}m
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Study Time This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progress by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Progress by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((cat) => {
                const percentage = cat.total > 0 ? (cat.completed / cat.total) * 100 : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium capitalize">{cat.name}</span>
                      <span className="text-slate-600">
                        {cat.completed}/{cat.total} lessons
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}