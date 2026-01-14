import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Settings as SettingsIcon, Users, DollarSign, BookOpen, Eye } from 'lucide-react';
import { toast } from 'sonner';
import TeachCourseCurriculum from '@/components/instructor/TeachCourseCurriculum';
import TeachCoursePricing from '@/components/instructor/TeachCoursePricing';
import TeachCourseStudents from '@/components/instructor/TeachCourseStudents';
import TeachCourseSettings from '@/components/instructor/TeachCourseSettings';

export default function TeachCourse() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState('curriculum');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        setCourseId(id);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0] || null;
    },
    enabled: !!courseId
  });

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-8 shadow-xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(createPageUrl('Teach'))}
          className="text-white hover:bg-white/10 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-indigo-200">{course.subtitle || 'Course Builder'}</p>
          </div>
          <Button 
            variant="secondary"
            onClick={() => window.open(createPageUrl(`CourseDetail?id=${course.id}`), '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="curriculum">
            <BookOpen className="w-4 h-4 mr-2" />
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing & Access
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum">
          <TeachCourseCurriculum course={course} user={user} />
        </TabsContent>

        <TabsContent value="pricing">
          <TeachCoursePricing course={course} schoolId={activeSchoolId} />
        </TabsContent>

        <TabsContent value="students">
          <TeachCourseStudents course={course} schoolId={activeSchoolId} />
        </TabsContent>

        <TabsContent value="settings">
          <TeachCourseSettings course={course} />
        </TabsContent>
      </Tabs>
    </div>
  );
}