import React from 'react';
import { Award, Flame, Star, Trophy, Target, Users, Zap, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AchievementBadge({ achievement, size = 'md' }) {
  const badgeIcons = {
    first_lesson: BookOpen,
    first_course: Trophy,
    streak_7: Flame,
    streak_30: Flame,
    streak_100: Flame,
    complete_5_courses: Target,
    complete_10_courses: Trophy,
    early_bird: Star,
    night_owl: Star,
    discussion_contributor: Users,
    quiz_master: Zap,
    perfect_score: Award,
    learning_path_complete: Trophy,
    community_helper: Users
  };

  const badgeColors = {
    first_lesson: 'from-blue-400 to-blue-600',
    first_course: 'from-green-400 to-green-600',
    streak_7: 'from-orange-400 to-red-600',
    streak_30: 'from-red-400 to-pink-600',
    streak_100: 'from-purple-400 to-purple-600',
    complete_5_courses: 'from-amber-400 to-amber-600',
    complete_10_courses: 'from-yellow-400 to-amber-600',
    early_bird: 'from-cyan-400 to-blue-600',
    night_owl: 'from-indigo-400 to-purple-600',
    discussion_contributor: 'from-teal-400 to-green-600',
    quiz_master: 'from-violet-400 to-purple-600',
    perfect_score: 'from-pink-400 to-rose-600',
    learning_path_complete: 'from-emerald-400 to-teal-600',
    community_helper: 'from-lime-400 to-green-600'
  };

  const Icon = badgeIcons[achievement.badge_type] || Award;
  const color = badgeColors[achievement.badge_type] || 'from-slate-400 to-slate-600';
  
  const sizes = {
    sm: { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-xs' },
    md: { container: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-sm' },
    lg: { container: 'w-24 h-24', icon: 'w-12 h-12', text: 'text-base' }
  };

  const sizeClasses = sizes[size];

  if (size === 'sm') {
    return (
      <div className="group relative">
        <div className={`${sizeClasses.container} rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer`}>
          <Icon className={`${sizeClasses.icon} text-white`} />
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
            {achievement.badge_name}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-xl transition-all group cursor-pointer">
      <CardContent className="p-6 text-center">
        <div className={`${sizeClasses.container} mx-auto mb-3 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className={`${sizeClasses.icon} text-white`} />
        </div>
        <h4 className={`font-bold text-slate-900 ${sizeClasses.text} mb-1`}>
          {achievement.badge_name}
        </h4>
        <p className="text-slate-600 text-xs line-clamp-2">
          {achievement.badge_description}
        </p>
        <div className="mt-2 text-xs text-amber-600 font-semibold">
          +{achievement.points} points
        </div>
      </CardContent>
    </Card>
  );
}