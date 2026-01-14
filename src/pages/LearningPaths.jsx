import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, CheckCircle, Crown, BookOpen, ArrowRight } from 'lucide-react';

export default function LearningPaths() {
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('free');

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

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: paths = [] } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: () => base44.entities.LearningPath.filter({ is_published: true })
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ is_published: true })
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  useEffect(() => {
    if (subscription?.tier) {
      setUserTier(subscription.tier);
    }
  }, [subscription]);

  const getPathProgress = (path) => {
    const pathCourses = path.course_ids || [];
    let completedCount = 0;

    pathCourses.forEach(courseId => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const courseLessons = courses.filter(l => l.course_id === courseId);
      const courseProgress = progress.filter(p => p.course_id === courseId && p.completed);
      
      if (courseLessons.length > 0 && courseLessons.length === courseProgress.length) {
        completedCount++;
      }
    });

    return pathCourses.length > 0 ? Math.round((completedCount / pathCourses.length) * 100) : 0;
  };

  const hasAccess = (path) => {
    return path.access_tier === 'free' ||
           (path.access_tier === 'premium' && ['premium', 'elite'].includes(userTier)) ||
           (path.access_tier === 'elite' && userTier === 'elite');
  };

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Learning Paths</h1>
            <p className="text-slate-300 text-lg mt-1">
              Structured journeys through Breslov teachings
            </p>
          </div>
        </div>
        <p className="text-slate-300">
          Follow curated paths designed to take you from beginner to advanced in specific areas of Torah study
        </p>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paths.map((path) => {
          const progressPct = getPathProgress(path);
          const access = hasAccess(path);
          const pathCourses = courses.filter(c => path.course_ids?.includes(c.id));

          return (
            <Card key={path.id} className="overflow-hidden hover:shadow-2xl transition-all group">
              <div className="relative h-48 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
                {path.thumbnail_url ? (
                  <img 
                    src={path.thumbnail_url} 
                    alt={path.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-20 h-20 text-white opacity-50" />
                  </div>
                )}
                
                {!access && (
                  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                    <div className="text-center">
                      <Crown className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                      <p className="text-white font-semibold">
                        {path.access_tier === 'premium' ? 'Premium' : 'Elite'} Required
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <Badge className={levelColors[path.level]}>
                    {path.level}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-2xl">{path.title}</CardTitle>
                {path.title_hebrew && (
                  <p className="text-amber-700 text-lg mt-1" dir="rtl">{path.title_hebrew}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-slate-600">{path.description}</p>

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{pathCourses.length} courses</span>
                  </div>
                  {path.estimated_months && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{path.estimated_months} months</span>
                    </div>
                  )}
                </div>

                {access && progressPct > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                      <span>Progress</span>
                      <span className="font-semibold">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Courses in this path:</p>
                  {pathCourses.slice(0, 3).map((course, idx) => (
                    <div key={course.id} className="flex items-center space-x-2 text-sm">
                      <span className="text-slate-500">{idx + 1}.</span>
                      <span className="text-slate-700">{course.title}</span>
                    </div>
                  ))}
                  {pathCourses.length > 3 && (
                    <p className="text-sm text-slate-500">
                      +{pathCourses.length - 3} more courses
                    </p>
                  )}
                </div>

                {access ? (
                  <Link to={createPageUrl(`LearningPathDetail?id=${path.id}`)}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 group/btn">
                      {progressPct > 0 ? 'Continue Path' : 'Start Learning Path'}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Link to={createPageUrl('Subscription')}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Access
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {paths.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">No learning paths available yet</p>
          <p className="text-slate-500 text-sm mt-2">Check back soon for structured learning journeys</p>
        </div>
      )}
    </div>
  );
}