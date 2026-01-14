import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseCard from '../components/courses/CourseCard';
import AdvancedSearch from '../components/search/AdvancedSearch';

export default function Courses() {
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('free');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [activeSchoolId, setActiveSchoolId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Get active school
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', activeSchoolId],
    queryFn: async () => {
      if (!activeSchoolId) return [];
      let schoolCourses = await base44.entities.Course.filter({ 
        is_published: true, 
        school_id: activeSchoolId 
      }, 'sort_order');
      
      // Fallback to legacy school if no courses found
      if (schoolCourses.length === 0) {
        const legacySchools = await base44.entities.School.filter({ slug: 'legacy' });
        if (legacySchools.length > 0) {
          schoolCourses = await base44.entities.Course.filter({ 
            is_published: true, 
            school_id: legacySchools[0].id 
          }, 'sort_order');
        }
      }
      
      return schoolCourses;
    },
    enabled: !!activeSchoolId
  });

  useEffect(() => {
    if (subscription?.tier) {
      setUserTier(subscription.tier);
    }
  }, [subscription]);

  useEffect(() => {
    setFilteredCourses(courses);
  }, [courses]);

  const handleFilter = (filtered) => {
    setFilteredCourses(filtered);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Course Library</h1>
        <p className="text-slate-600 text-lg">
          Explore the wisdom of Rebbe Nachman through our comprehensive courses
        </p>
      </div>

      {/* Advanced Search */}
      <AdvancedSearch courses={courses} onFilter={handleFilter} />

      {/* Results */}
      <div>
        <p className="text-slate-600 mb-6">
          Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} userTier={userTier} />
          ))}
        </div>

        {filteredCourses.length === 0 && !isLoading && (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-semibold mb-2">No courses found</p>
            <p className="text-slate-500">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}