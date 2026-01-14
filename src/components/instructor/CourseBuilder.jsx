import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, GripVertical, Trash2, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CourseBuilder({ course, onSave }) {
  const [courseData, setCourseData] = useState(course || {
    title: '',
    description: '',
    category: 'chassidus',
    level: 'beginner',
    access_tier: 'free',
    is_published: false
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (course?.id) {
        return await base44.entities.Course.update(course.id, data);
      } else {
        return await base44.entities.Course.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
      toast.success('Course saved successfully!');
      onSave?.();
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Course Title *</label>
            <Input
              value={courseData.title}
              onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
              placeholder="Introduction to Likutey Moharan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hebrew Title</label>
            <Input
              value={courseData.title_hebrew || ''}
              onChange={(e) => setCourseData({ ...courseData, title_hebrew: e.target.value })}
              placeholder="ליקוטי מוהר״ן"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <Textarea
              value={courseData.description}
              onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
              placeholder="Describe what students will learn..."
              className="min-h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select
                value={courseData.category}
                onValueChange={(value) => setCourseData({ ...courseData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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

            <div>
              <label className="block text-sm font-medium mb-2">Level</label>
              <Select
                value={courseData.level}
                onValueChange={(value) => setCourseData({ ...courseData, level: value })}
              >
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Access Tier</label>
              <Select
                value={courseData.access_tier}
                onValueChange={(value) => setCourseData({ ...courseData, access_tier: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price (Optional)</label>
              <Input
                type="number"
                value={courseData.price || ''}
                onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) })}
                placeholder="99.99"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Instructor Name *</label>
            <Input
              value={courseData.instructor}
              onChange={(e) => setCourseData({ ...courseData, instructor: e.target.value })}
              placeholder="Rabbi Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (hours)</label>
            <Input
              type="number"
              value={courseData.duration_hours || ''}
              onChange={(e) => setCourseData({ ...courseData, duration_hours: parseFloat(e.target.value) })}
              placeholder="10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={courseData.is_published}
              onChange={(e) => setCourseData({ ...courseData, is_published: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">Publish course (make visible to students)</label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => onSave?.()}>Cancel</Button>
        <Button
          onClick={() => saveMutation.mutate(courseData)}
          disabled={!courseData.title || !courseData.description || !courseData.instructor}
        >
          {course ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </div>
  );
}