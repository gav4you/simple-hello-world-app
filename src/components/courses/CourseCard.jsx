import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Crown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CourseCard({ course, userTier = 'free' }) {
  const tierIcons = {
    free: { icon: Sparkles, color: 'text-slate-500' },
    premium: { icon: Crown, color: 'text-blue-500' },
    elite: { icon: Crown, color: 'text-amber-500' }
  };

  const TierIcon = tierIcons[course.access_tier]?.icon || Sparkles;
  const tierColor = tierIcons[course.access_tier]?.color || 'text-slate-500';

  const hasAccess = 
    course.access_tier === 'free' ||
    (course.access_tier === 'premium' && ['premium', 'elite'].includes(userTier)) ||
    (course.access_tier === 'elite' && userTier === 'elite');

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  return (
    <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
      <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer h-full">
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
          {course.thumbnail_url ? (
            <img 
              src={course.thumbnail_url} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TierIcon className={`w-16 h-16 ${tierColor} opacity-50`} />
            </div>
          )}
          
          {!hasAccess && (
            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
              <div className="text-center">
                <Crown className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                <p className="text-white font-semibold">
                  {course.access_tier === 'premium' ? 'Premium' : 'Elite'} Required
                </p>
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={levelColors[course.level]}>
              {course.level}
            </Badge>
            <Badge className="bg-slate-900/80 text-white border-0">
              <TierIcon className="w-3 h-3 mr-1" />
              {course.access_tier}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5">
          <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
          {course.title_hebrew && (
            <p className="text-amber-700 font-semibold mb-2 text-lg" dir="rtl">
              {course.title_hebrew}
            </p>
          )}
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <span className="font-medium">By {course.instructor}</span>
            {course.duration_hours && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration_hours}h</span>
              </div>
            )}
          </div>

          {course.price && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">One-time purchase</span>
                <span className="text-2xl font-bold text-slate-900">${course.price}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}