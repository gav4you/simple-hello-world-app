import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TeachAnalytics() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: myCourses = [] } = useQuery({
    queryKey: ['my-courses', user?.email, activeSchoolId],
    queryFn: async () => {
      const created = await base44.entities.Course.filter({
        school_id: activeSchoolId,
        created_by: user.email
      });
      
      const staffRecords = await base44.entities.CourseStaff.filter({
        school_id: activeSchoolId,
        user_email: user.email
      });
      
      const staffCourseIds = staffRecords.map(s => s.course_id);
      const staffCourses = [];
      
      for (const id of staffCourseIds) {
        const courses = await base44.entities.Course.filter({ id });
        if (courses.length > 0) staffCourses.push(courses[0]);
      }
      
      const allCourses = [...created, ...staffCourses];
      return Array.from(new Map(allCourses.map(c => [c.id, c])).values());
    },
    enabled: !!user && !!activeSchoolId
  });

  const { data: entitlements = [] } = useQuery({
    queryKey: ['my-entitlements', activeSchoolId, myCourses],
    queryFn: async () => {
      const allEntitlements = [];
      for (const course of myCourses) {
        const courseEnts = await base44.entities.Entitlement.filter({
          school_id: activeSchoolId,
          course_id: course.id
        });
        allEntitlements.push(...courseEnts);
      }
      return allEntitlements;
    },
    enabled: !!activeSchoolId && myCourses.length > 0
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['my-progress', myCourses],
    queryFn: async () => {
      const allProgress = [];
      for (const course of myCourses) {
        const courseProgress = await base44.entities.UserProgress.filter({
          course_id: course.id
        });
        allProgress.push(...courseProgress);
      }
      return allProgress;
    },
    enabled: myCourses.length > 0
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['my-posts', myCourses],
    queryFn: async () => {
      const allPosts = [];
      for (const course of myCourses) {
        const coursePosts = await base44.entities.Post.filter({
          course_id: course.id
        });
        allPosts.push(...coursePosts);
      }
      return allPosts;
    },
    enabled: myCourses.length > 0
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['my-payouts', user?.email, activeSchoolId],
    queryFn: () => base44.entities.InstructorPayout.filter({
      school_id: activeSchoolId,
      instructor_email: user.email
    }, '-created_date'),
    enabled: !!user && !!activeSchoolId
  });

  const totalEnrollments = entitlements.length;
  const avgCompletion = progress.length > 0
    ? (progress.filter(p => p.completed).length / progress.length * 100)
    : 0;
  const totalEarnings = payouts
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount_cents, 0);

  const coursePerformance = myCourses.map(course => {
    const courseEnrollments = entitlements.filter(e => e.course_id === course.id).length;
    const courseProgress = progress.filter(p => p.course_id === course.id);
    const completion = courseProgress.length > 0
      ? (courseProgress.filter(p => p.completed).length / courseProgress.length * 100)
      : 0;
    
    return {
      name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
      enrollments: courseEnrollments,
      completion: Math.round(completion)
    };
  });

  const studentsNeedingHelp = progress
    .filter(p => p.progress_percentage < 50 && !p.completed)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Teaching Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              My Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myCourses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEnrollments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Avg Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgCompletion.toFixed(0)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(totalEarnings / 100).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Course Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coursePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="enrollments" fill="#3b82f6" name="Enrollments" />
              <Bar dataKey="completion" fill="#10b981" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Community Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Posts</span>
                <span className="font-bold text-xl">{posts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Questions</span>
                <span className="font-bold text-xl">
                  {posts.filter(p => p.post_type === 'QUESTION').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
              Students Needing Help
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsNeedingHelp.length === 0 ? (
              <p className="text-sm text-slate-500">All students progressing well!</p>
            ) : (
              <div className="space-y-2">
                {studentsNeedingHelp.slice(0, 5).map((p) => (
                  <div key={p.id} className="text-sm flex justify-between">
                    <span className="text-slate-700">{p.user_email}</span>
                    <span className="text-slate-500">{p.progress_percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No payouts yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Period</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-right py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b">
                      <td className="py-3 px-4">
                        {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        ${(payout.amount_cents / 100).toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          payout.status === 'PAID' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}