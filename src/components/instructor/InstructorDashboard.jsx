import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, Star, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function InstructorDashboard({ instructor, courses, analytics }) {
  const totalStudents = analytics.reduce((sum, a) => sum + (a.total_students || 0), 0);
  const totalRevenue = analytics.reduce((sum, a) => sum + (a.total_revenue || 0), 0);
  const avgRating = analytics.length > 0 
    ? analytics.reduce((sum, a) => sum + (a.average_rating || 0), 0) / analytics.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {instructor.name}</h1>
        <p className="text-indigo-200">Here's how your courses are performing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Students</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalStudents}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">${totalRevenue}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Average Rating</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{avgRating.toFixed(1)}</p>
              </div>
              <Star className="w-10 h-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Courses</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{courses.length}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-auto py-4 flex-col space-y-2">
            <Plus className="w-6 h-6" />
            <span>New Course</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col space-y-2">
            <Plus className="w-6 h-6" />
            <span>New Lesson</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col space-y-2">
            <Users className="w-6 h-6" />
            <span>View Students</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col space-y-2">
            <Star className="w-6 h-6" />
            <span>Reviews</span>
          </Button>
        </CardContent>
      </Card>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => {
              const courseAnalytics = analytics.find(a => a.course_id === course.id);
              return (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{course.title}</h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                      <span>{courseAnalytics?.total_students || 0} students</span>
                      <span>•</span>
                      <span>{courseAnalytics?.completion_rate || 0}% completion</span>
                      <span>•</span>
                      <span>⭐ {courseAnalytics?.average_rating || 0}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}