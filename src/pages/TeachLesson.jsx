import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function TeachLesson() {
  const [user, setUser] = useState(null);
  const [lessonId, setLessonId] = useState(null);
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const params = new URLSearchParams(window.location.search);
        setLessonId(params.get('id'));
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      const l = lessons[0];
      if (l) setContent(l.content || '');
      return l;
    },
    enabled: !!lessonId
  });

  const { data: course } = useQuery({
    queryKey: ['course', lesson?.course_id],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: lesson.course_id });
      return courses[0];
    },
    enabled: !!lesson
  });

  const updateLessonMutation = useMutation({
    mutationFn: (data) => base44.entities.Lesson.update(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson']);
      toast.success('Lesson saved!');
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    updateLessonMutation.mutate({
      title: formData.get('title'),
      content,
      video_url: formData.get('video_url'),
      audio_url: formData.get('audio_url'),
      duration_minutes: parseInt(formData.get('duration_minutes')) || 0,
      drip_days_after_enroll: parseInt(formData.get('drip_days_after_enroll')) || null
    });
  };

  const toggleStatus = () => {
    const newStatus = lesson.status === 'draft' ? 'published' : 'draft';
    updateLessonMutation.mutate({ status: newStatus });
  };

  if (isLoading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(createPageUrl(`TeachCourse?id=${lesson.course_id}`))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-sm text-slate-600">{course?.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={lesson.status === 'published' ? 'default' : 'secondary'}>
            {lesson.status}
          </Badge>
          <Button variant="outline" onClick={toggleStatus}>
            {lesson.status === 'draft' ? 'Publish' : 'Unpublish'}
          </Button>
          <Button 
            variant="ghost"
            onClick={() => window.open(createPageUrl(`LessonViewer?id=${lesson.id}`), '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Editor */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input name="title" defaultValue={lesson.title} required />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <div className="border rounded-lg">
                <ReactQuill 
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  style={{ minHeight: '300px' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input name="video_url" defaultValue={lesson.video_url} placeholder="https://youtube.com/..." />
              </div>
              <div className="space-y-2">
                <Label>Audio URL</Label>
                <Input name="audio_url" defaultValue={lesson.audio_url} placeholder="https://..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input name="duration_minutes" type="number" defaultValue={lesson.duration_minutes} />
              </div>
              {course?.drip_enabled && (
                <div className="space-y-2">
                  <Label>Drip: Days After Enrollment</Label>
                  <Input 
                    name="drip_days_after_enroll" 
                    type="number" 
                    defaultValue={lesson.drip_days_after_enroll}
                    placeholder="0 = immediate"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save Lesson
        </Button>
      </form>
    </div>
  );
}