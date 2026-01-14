import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';

export default function StudentProgressReport({ studentEmail }) {
  // In a real implementation, this would fetch actual data
  const mockData = {
    coursesEnrolled: 5,
    coursesCompleted: 2,
    totalStudyHours: 45,
    averageGrade: 87,
    streak: 12,
    upcomingAssignments: 3
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Courses</p>
                <p className="text-2xl font-bold">{mockData.coursesCompleted}/{mockData.coursesEnrolled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Study Hours</p>
                <p className="text-2xl font-bold">{mockData.totalStudyHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-slate-600">Avg Grade</p>
                <p className="text-2xl font-bold">{mockData.averageGrade}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Streak</p>
                <p className="text-2xl font-bold">{mockData.streak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {['Introduction to Torah', 'Hebrew Language', 'Jewish History'].map((course, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{course}</span>
                <span className="text-sm text-slate-600">{60 + idx * 15}%</span>
              </div>
              <Progress value={60 + idx * 15} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}