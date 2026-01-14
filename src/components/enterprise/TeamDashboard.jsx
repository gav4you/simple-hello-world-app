import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, BookOpen, Clock, Award } from 'lucide-react';

export default function TeamDashboard({ team }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Team Members</p>
                <p className="text-2xl font-bold">{team?.member_emails?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Assigned Courses</p>
                <p className="text-2xl font-bold">{team?.assigned_courses?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Study Hours</p>
                <p className="text-2xl font-bold">{team?.total_study_hours || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-slate-600">Completion Rate</p>
                <p className="text-2xl font-bold">{team?.completion_rate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {team?.assigned_courses?.map((courseId, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Course {idx + 1}</span>
                  <span className="text-sm text-slate-600">
                    {Math.floor(Math.random() * 100)}% complete
                  </span>
                </div>
                <Progress value={Math.floor(Math.random() * 100)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}