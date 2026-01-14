import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CourseCard from '../courses/CourseCard';

export default function CourseRecommendations({ user, userProgress, courses }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [user, userProgress, courses]);

  const generateRecommendations = async () => {
    if (!user || !courses || courses.length === 0) return;

    setIsGenerating(true);

    try {
      // Get completed courses
      const completedCourseIds = [...new Set(
        userProgress
          .filter(p => p.completed)
          .map(p => p.course_id)
      )];

      const completedCourses = courses.filter(c => completedCourseIds.includes(c.id));
      
      // Simple recommendation algorithm
      // 1. Recommend courses in same category as completed ones
      // 2. Recommend next level courses
      // 3. Recommend popular courses
      
      const recommended = [];

      // Same category recommendations
      if (completedCourses.length > 0) {
        const categories = [...new Set(completedCourses.map(c => c.category))];
        const sameCategoryCourses = courses.filter(c => 
          categories.includes(c.category) && 
          !completedCourseIds.includes(c.id)
        ).slice(0, 2);
        
        sameCategoryCourses.forEach(c => {
          recommended.push({
            course: c,
            reason: 'Based on your interest in ' + c.category.replace(/_/g, ' '),
            confidence: 85
          });
        });
      }

      // Next level recommendations
      const userLevels = completedCourses.map(c => c.level);
      if (userLevels.includes('beginner')) {
        const intermediateCourses = courses.filter(c => 
          c.level === 'intermediate' && 
          !completedCourseIds.includes(c.id)
        ).slice(0, 2);
        
        intermediateCourses.forEach(c => {
          recommended.push({
            course: c,
            reason: 'Ready for intermediate level',
            confidence: 80
          });
        });
      }

      // Popular courses (for new users)
      if (completedCourses.length === 0) {
        const popularCourses = courses
          .filter(c => c.access_tier === 'free')
          .slice(0, 3);
        
        popularCourses.forEach(c => {
          recommended.push({
            course: c,
            reason: 'Great for beginners',
            confidence: 75
          });
        });
      }

      // Remove duplicates and limit to 3
      const uniqueRecommendations = recommended
        .filter((r, idx, self) => 
          idx === self.findIndex(t => t.course.id === r.course.id)
        )
        .slice(0, 3);

      setRecommendations(uniqueRecommendations);

      // Save recommendations to database
      for (const rec of uniqueRecommendations) {
        await base44.entities.Recommendation.create({
          user_email: user.email,
          course_id: rec.course.id,
          reason: rec.reason,
          confidence_score: rec.confidence,
          based_on: completedCourseIds,
          shown: true,
          clicked: false
        });
      }

    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span>Recommended For You</span>
          </CardTitle>
          <p className="text-slate-600 text-sm">
            Personalized course suggestions based on your learning journey
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <div key={rec.course.id} className="relative">
            <div className="absolute -top-3 left-3 z-10">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                <Star className="w-3 h-3" />
                <span>{rec.confidence}% match</span>
              </div>
            </div>
            <CourseCard course={rec.course} />
            <p className="text-sm text-slate-600 mt-2 text-center italic">
              {rec.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}