import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Eye, GripVertical, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function TeachCourseCurriculum({ course, user }) {
  const [showDialog, setShowDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: lessons = [] } = useQuery({
    queryKey: ['course-lessons', course.id],
    queryFn: () => base44.entities.Lesson.filter({ course_id: course.id }, 'order'),
    enabled: !!course
  });

  const createLessonMutation = useMutation({
    mutationFn: async (title) => {
      const maxOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) : 0;
      return await base44.entities.Lesson.create({
        school_id: course.school_id,
        course_id: course.id,
        created_by: user.email,
        title,
        content: '',
        order: maxOrder + 1,
        status: 'draft'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course-lessons']);
      setShowDialog(false);
      toast.success('Lesson created!');
    }
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lesson.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['course-lessons']);
      toast.success('Updated!');
    }
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.update(course.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['course']);
      toast.success('Course published!');
    }
  });

  const handleCreateLesson = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createLessonMutation.mutate(formData.get('title'));
  };

  const toggleLessonStatus = (lesson) => {
    const newStatus = lesson.status === 'draft' ? 'published' : 'draft';
    updateLessonMutation.mutate({ id: lesson.id, data: { status: newStatus } });
  };

  const publishCourse = () => {
    if (lessons.length === 0) {
      toast.error('Add at least one lesson before publishing');
      return;
    }
    updateCourseMutation.mutate({ status: 'published', is_published: true });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Course Curriculum</CardTitle>
          <div className="flex space-x-2">
            {course.status === 'draft' && lessons.length > 0 && (
              <Button onClick={publishCourse}>
                <Check className="w-4 h-4 mr-2" />
                Publish Course
              </Button>
            )}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lesson
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Lesson</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateLesson} className="space-y-4">
                  <Input name="title" placeholder="Lesson title" required />
                  <Button type="submit" className="w-full">Create Lesson</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-slate-600 mb-4">No lessons yet</p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Lesson
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50">
                  <GripVertical className="w-5 h-5 text-slate-400" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-500">#{index + 1}</span>
                      <h4 className="font-semibold">{lesson.title}</h4>
                      <Badge variant={lesson.status === 'published' ? 'default' : 'secondary'}>
                        {lesson.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleLessonStatus(lesson)}
                    >
                      {lesson.status === 'draft' ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Publish
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Unpublish
                        </>
                      )}
                    </Button>
                    <Link to={createPageUrl(`TeachLesson?id=${lesson.id}`)}>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link to={createPageUrl(`LessonViewer?id=${lesson.id}`)} target="_blank">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}