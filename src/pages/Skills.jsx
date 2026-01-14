import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, BookOpen } from 'lucide-react';

export default function Skills() {
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

  const { data: assessments = [] } = useQuery({
    queryKey: ['skill-assessments', user?.email],
    queryFn: () => base44.entities.SkillAssessment.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: skillGaps = [] } = useQuery({
    queryKey: ['skill-gaps', user?.email],
    queryFn: () => base44.entities.SkillGap.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-900 to-teal-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Target className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Skills & Competencies</h1>
            <p className="text-green-200 text-lg">Track your professional development</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((assessment) => (
          <Card key={assessment.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{assessment.skill_name}</h3>
                  <Badge>{assessment.current_level}</Badge>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <Progress value={assessment.assessment_score} className="mb-4" />
              <p className="text-sm text-slate-600">Score: {assessment.assessment_score}%</p>
              {assessment.recommended_courses?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Recommended Courses:</p>
                  <div className="flex items-center text-sm text-blue-600">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>{assessment.recommended_courses.length} courses</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}