import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { scopedFilter } from '@/components/api/scoped';
import { useSession } from '@/components/hooks/useSession';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CheckCircle, Clock, Crown, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StatCard from '../components/dashboard/StatCard';
import CourseCard from '../components/courses/CourseCard';
import CourseRecommendations from '../components/ai/CourseRecommendations';
import LearningInsights from '../components/insights/LearningInsights';
import AnnouncementsPanel from '../components/announcements/AnnouncementsPanel';

export default function Dashboard() {
  const { user, activeSchoolId, isLoading } = useSession();
  const [userTier, setUserTier] = useState('free');
useEffect(() => {
    if (!isLoading && !user) {
      try { base44.auth.redirectToLogin(); } catch {}
    }
  }, [isLoading, user]);

const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', activeSchoolId],
    queryFn: async () => {
      if (!activeSchoolId) return [];
      let schoolCourses = await base44.entities.Course.filter({ 
        is_published: true, 
        school_id: activeSchoolId 
      }, '-created_date', 6);
      
      // Fallback to legacy school if no courses
      if (schoolCourses.length === 0) {
        const legacySchools = await base44.entities.School.filter({ slug: 'legacy' });
        if (legacySchools.length > 0) {
          schoolCourses = await scopedFilter('Course', legacySchools[0].id, { is_published: true }, '-created_date', 6);
        }
      }
      
      return schoolCourses;
    },
    enabled: !!activeSchoolId
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', user?.email],
    queryFn: async () => {
      const courseProgress = await scopedFilter('UserProgress', activeSchoolId, { user_email: user.email });
      const insights = await base44.entities.LearningInsight.filter({ user_email: user.email, is_read: false });
      return { courseProgress, insights };
    },
    enabled: !!activeSchoolId && !!user?.email
  });

  useEffect(() => {
    if (subscription?.tier) {
      setUserTier(subscription.tier);
    }
  }, [subscription]);

  const completedLessons = progress?.courseProgress?.filter(p => p.completed).length || 0;
  const inProgressCourses = [...new Set(progress?.courseProgress?.filter(p => !p.completed).map(p => p.course_id) || [])].length;

  const tierBenefits = {
    free: { name: 'Free', color: 'text-slate-600', icon: Star },
    premium: { name: 'Premium', color: 'text-blue-600', icon: Crown },
    elite: { name: 'Elite', color: 'text-amber-600', icon: Crown }
  };

  const currentTier = tierBenefits[userTier];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-white mb-6 md:mb-0">
            <h1 className="text-4xl font-bold mb-2">
              Shalom, {user?.full_name || 'Student'}
            </h1>
            <p className="text-slate-300 text-lg">
              Continue your journey through the teachings of Rebbe Nachman
            </p>
            <div className="flex items-center space-x-2 mt-4">
              {React.createElement(currentTier.icon, { className: `w-5 h-5 ${currentTier.color}` })}
              <span className={`font-semibold ${currentTier.color}`}>
                {currentTier.name} Member
              </span>
            </div>
          </div>
          {userTier === 'free' && (
            <Link to={createPageUrl('Subscription')}>
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-6 text-lg shadow-xl">
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Premium
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={BookOpen}
          label="Courses Available"
          value={courses.length}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Lessons Completed"
          value={completedLessons}
          color="from-green-500 to-green-600"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={inProgressCourses}
          color="from-amber-500 to-amber-600"
        />
      </div>

      {/* Featured Quote */}
      <div className="bg-gradient-to-r from-amber-50 to-blue-50 rounded-xl p-8 border-l-4 border-amber-500">
        <p className="text-slate-700 text-xl italic font-serif mb-3">
          "The essence of Torah study is to turn the intellect toward Hashem and to come closer to Him through the wisdom of Torah."
        </p>
        <p className="text-slate-600 font-semibold">— Likutey Moharan I:25</p>
      </div>

      {/* Announcements */}
      <AnnouncementsPanel user={user} schoolId={activeSchoolId} />

      {/* AI Recommendations */}
      <CourseRecommendations 
        user={user} 
        userProgress={progress} 
        courses={courses} 
      />

      {/* Featured Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Featured Courses</h2>
          <Link to={createPageUrl('Courses')}>
            <Button variant="outline" className="group">
              View All Courses
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} userTier={userTier} />
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No courses available yet</p>
            <p className="text-slate-500 text-sm mt-2">Check back soon for new Torah content</p>
          </div>
        )}
      </div>
    </div>
  );
}