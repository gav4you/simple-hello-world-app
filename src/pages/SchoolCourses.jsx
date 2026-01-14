import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import useStorefrontContext from '../components/hooks/useStorefrontContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

export default function SchoolCourses() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Not logged in
      }
    };
    loadUser();
  }, []);

  const { data: school } = useQuery({
    queryKey: ['school-by-slug', slug],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ slug });
      return schools[0];
    },
    enabled: !!slug
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['public-courses', school?.id],
    queryFn: () => base44.entities.Course.filter({
      school_id: school.id,
      is_published: true
    }),
    enabled: !!school?.id
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    const matchesAccess = accessFilter === 'all' || course.access_level === accessFilter;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesAccess;
  });

  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];

  if (!school) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">School not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Link to={createPageUrl(`SchoolLanding?slug=${slug}`)} className="text-amber-400 hover:underline mb-4 block">
            ← Back to {school.name}
          </Link>
          <h1 className="text-4xl font-bold">Course Catalog</h1>
          <p className="text-slate-300 mt-2">Explore our courses and start learning today</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="pl-10"
              />
            </div>
            
            {categories.length > 0 && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-slate-600">{filteredCourses.length} courses found</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                {course.cover_image_url && (
                  <img 
                    src={course.cover_image_url} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  {course.access_level === 'FREE' && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-2 inline-block">
                      Free
                    </span>
                  )}
                  <h3 className="font-bold text-xl mb-2">{course.title}</h3>
                  {course.subtitle && (
                    <p className="text-slate-600 text-sm mb-3">{course.subtitle}</p>
                  )}
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <Link to={createPageUrl(`CourseSales?slug=${slug}&courseId=${course.id}`)}>
                    <Button className="w-full">View Course</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No courses found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}