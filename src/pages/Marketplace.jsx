import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: courses = [] } = useQuery({
    queryKey: ['marketplace-courses'],
    queryFn: () => base44.entities.Course.filter({ is_published: true }, '-created_date')
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.CourseReview.list()
  });

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCourseRating = (courseId) => {
    const courseReviews = reviews.filter(r => r.course_id === courseId);
    if (courseReviews.length === 0) return 5.0;
    return (courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length).toFixed(1);
  };

  const getCourseStudents = (courseId) => {
    return Math.floor(Math.random() * 5000) + 100;
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Course Marketplace</h1>
        <p className="text-purple-200 text-lg">Discover world-class Torah courses</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search 10,000+ courses..."
          className="pl-12 h-14 text-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <Link key={course.id} to={createPageUrl(`CourseDetail?id=${course.id}`)}>
            <Card className="hover:shadow-2xl transition-all cursor-pointer overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-white text-6xl">
                    📚
                  </div>
                )}
                <Badge className="absolute top-3 right-3 bg-amber-500">
                  {course.access_tier}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-slate-600 mb-3">by {course.instructor}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="font-semibold">{getCourseRating(course.id)}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>{getCourseStudents(course.id).toLocaleString()}</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {course.price ? `$${course.price}` : 'Free'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}