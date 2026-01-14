import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { canCreateCourses } from '@/components/utils/permissions';

export default function TeachCourseNew() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [membership, setMembership] = useState(null);
  const [creating, setCreating] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const formData = new FormData(e.target);
      
      const courseData = {
        school_id: activeSchoolId,
        created_by: user.email,
        title: formData.get('title'),
        subtitle: formData.get('subtitle'),
        description: formData.get('description'),
        instructor: user.full_name || user.email,
        category: formData.get('category'),
        level: formData.get('level'),
        cover_image_url: formData.get('cover_image_url'),
        status: 'draft',
        access_level: 'FREE',
        visibility: 'school_only',
        is_published: false
      };

      const course = await base44.entities.Course.create(courseData);

      // Create CourseStaff record
      await base44.entities.CourseStaff.create({
        school_id: activeSchoolId,
        course_id: course.id,
        user_email: user.email,
        role: 'INSTRUCTOR'
      });

      toast.success('Course created!');
      navigate(createPageUrl(`TeachCourse?id=${course.id}`));
    } catch (error) {
      toast.error('Failed to create course');
      setCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(createPageUrl('Teach'))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create New Course</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Course Title *</Label>
              <Input name="title" placeholder="Introduction to Breslov Chassidus" required />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input name="subtitle" placeholder="Learn the fundamentals of Rebbe Nachman's teachings" />
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea name="description" rows={5} placeholder="What will students learn in this course?" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="likutey_moharan">Likutey Moharan</SelectItem>
                    <SelectItem value="sippurei_maasiyot">Sippurei Maasiyot</SelectItem>
                    <SelectItem value="halacha">Halacha</SelectItem>
                    <SelectItem value="chassidus">Chassidus</SelectItem>
                    <SelectItem value="tefillah">Tefillah</SelectItem>
                    <SelectItem value="holidays">Holidays</SelectItem>
                    <SelectItem value="life_guidance">Life Guidance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Level *</Label>
                <Select name="level" defaultValue="beginner">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input name="cover_image_url" type="url" placeholder="https://example.com/image.jpg" />
            </div>

            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? 'Creating...' : 'Create Course'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}