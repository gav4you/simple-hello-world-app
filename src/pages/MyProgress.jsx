import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { scopedFilter, scopedList } from '@/components/api/scoped';
import { useSession } from '@/components/hooks/useSession';
import { useQuery } from '@tanstack/react-query';
import { Trophy, BookOpen, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import StatCard from '../components/dashboard/StatCard';

export default function MyProgress() {
  const { user, activeSchoolId, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !user) {
      try { base44.auth.redirectToLogin(); } catch {}
    }
  }, [isLoading, user]);

const { data: progress = [] } = useQuery({
    queryKey: ['progress', activeSchoolId, user?.email],
    queryFn: () => scopedFilter('UserProgress', activeSchoolId, { user_email: user.email }),
    enabled: !!activeSchoolId && !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', activeSchoolId],
    queryFn: () => scopedFilter('Course', activeSchoolId, { is_published: true })
    ,
    enabled: !!activeSchoolId
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', activeSchoolId],
    queryFn: () => scopedList('Lesson', activeSchoolId, 'order', 500)
    ,
    enabled: !!activeSchoolId
  });

  const completedLessons = progress.filter(p => p.completed).length;
  const inProgressCourses = [...new Set(progress.filter(p => !p.completed).map(p => p.course_id))];
  const completedCourses = courses.filter(course => {
    const courseLessons = lessons.filter(l => l.course_id === course.id);
    const courseProgress = progress.filter(p => p.course_id === course.id && p.completed);
    return courseLessons.length > 0 && courseLessons.length === courseProgress.length;
  });

  const getCourseProgress = (courseId) => {
    const courseLessons = lessons.filter(l => l.course_id === courseId);
    const courseCompleted = progress.filter(p => p.course_id === courseId && p.completed);
    if (courseLessons.length === 0) return 0;
    return Math.round((courseCompleted.length / courseLessons.length) * 100);
  };

  const coursesInProgress = courses.filter(course => {
    const progressPct = getCourseProgress(course.id);
    return progressPct > 0 && progressPct < 100;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">My Learning Progress</h1>
        <p className="text-slate-600 text-lg">Track your journey through the Torah of Rebbe Nachman</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Trophy}
          label="Completed Courses"
          value={completedCourses.length}
          color="from-amber-500 to-amber-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Lessons Finished"
          value={completedLessons}
          color="from-green-500 to-green-600"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={coursesInProgress.length}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Learning Streak"
          value="7 days"
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Courses in Progress */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Continue Learning</h2>
        
        {coursesInProgress.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coursesInProgress.map(course => {
              const progressPct = getCourseProgress(course.id);
              const courseLessons = lessons.filter(l => l.course_id === course.id);
              const completedCount = progress.filter(p => p.course_id === course.id && p.completed).length;
              
              return (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Badge className="bg-blue-100 text-blue-800">
                        {progressPct}%
                      </Badge>
                    </div>
                    {course.title_hebrew && (
                      <p className="text-amber-700 text-sm" dir="rtl">{course.title_hebrew}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                          <span>{completedCount} of {courseLessons.length} lessons</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                      <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition-colors">
                          Continue Course
                        </button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-slate-50">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">No courses in progress</h3>
              <p className="text-slate-600 mb-4">Start learning to see your progress here</p>
              <Link to={createPageUrl('Courses')}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg">
                  Browse Courses
                </button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Completed Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {completedCourses.map(course => (
              <Card key={course.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <Badge className="bg-green-600 text-white">Completed</Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
                  {course.title_hebrew && (
                    <p className="text-amber-700 text-sm mb-3" dir="rtl">{course.title_hebrew}</p>
                  )}
                  <p className="text-slate-600 text-sm">By {course.instructor}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notes */}
      {progress.filter(p => p.notes).length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Study Notes</h2>
          <div className="space-y-4">
            {progress
              .filter(p => p.notes)
              .slice(0, 5)
              .map(p => {
                const lesson = lessons.find(l => l.id === p.lesson_id);
                const course = courses.find(c => c.id === p.course_id);
                
                return (
                  <Card key={p.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">
                            {lesson?.title || 'Lesson'}
                          </h4>
                          <p className="text-slate-600 text-sm mb-2">{course?.title}</p>
                          <p className="text-slate-700 text-sm italic">"{p.notes}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}