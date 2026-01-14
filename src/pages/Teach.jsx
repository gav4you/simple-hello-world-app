import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Users, TrendingUp, FileText } from 'lucide-react';
import { canCreateCourses } from '@/components/utils/permissions';

export default function Teach() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [membership, setMembership] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);

        if (schoolId) {
          const memberships = await base44.entities.SchoolMembership.filter({
            user_email: currentUser.email,
            school_id: schoolId
          });
          
          if (memberships.length > 0) {
            setMembership(memberships[0]);
            
            // Check permission
            if (!canCreateCourses(memberships[0].role)) {
              navigate(createPageUrl('Dashboard'));
            }
          } else {
            navigate(createPageUrl('Dashboard'));
          }
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: myCourses = [] } = useQuery({
    queryKey: ['my-courses', user?.email, activeSchoolId],
    queryFn: async () => {
      if (!user?.email || !activeSchoolId) return [];
      
      // Get courses created by user
      const created = await base44.entities.Course.filter({
        school_id: activeSchoolId,
        created_by: user.email
      });
      
      // Get courses where user is staff
      const staffRecords = await base44.entities.CourseStaff.filter({
        school_id: activeSchoolId,
        user_email: user.email
      });
      
      const staffCourseIds = staffRecords.map(s => s.course_id);
      const staffCourses = [];
      
      for (const id of staffCourseIds) {
        const courses = await base44.entities.Course.filter({ id });
        if (courses.length > 0) staffCourses.push(courses[0]);
      }
      
      // Combine and deduplicate
      const allCourses = [...created, ...staffCourses];
      const uniqueCourses = Array.from(new Map(allCourses.map(c => [c.id, c])).values());
      
      return uniqueCourses;
    },
    enabled: !!user && !!activeSchoolId
  });

  const draftCourses = myCourses.filter(c => c.status === 'draft');
  const publishedCourses = myCourses.filter(c => c.status === 'published');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
            <p className="text-indigo-200 text-lg">
              Manage your courses and connect with students
            </p>
          </div>
          <Link to={createPageUrl('TeachCourseNew')}>
            <Button className="bg-white text-indigo-900 hover:bg-indigo-50" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myCourses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{publishedCourses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{draftCourses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">-</div>
            <p className="text-xs text-slate-500 mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Draft Courses */}
      {draftCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Drafts Needing Attention</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draftCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg">{course.title}</h3>
                    <Badge variant="secondary">Draft</Badge>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <Link to={createPageUrl(`TeachCourse?id=${course.id}`)}>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Continue Editing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Courses */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {myCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {course.cover_image_url && (
                  <img 
                    src={course.cover_image_url} 
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{course.title}</h3>
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {course.category}
                    </span>
                    <Link to={createPageUrl(`TeachCourse?id=${course.id}`)}>
                      <Button size="sm">Manage</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {myCourses.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No courses yet
              </h3>
              <p className="text-slate-600 mb-6">
                Create your first course to start teaching
              </p>
              <Link to={createPageUrl('TeachCourseNew')}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}