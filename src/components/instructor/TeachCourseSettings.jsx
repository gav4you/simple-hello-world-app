import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function TeachCourseSettings({ course }) {
  const queryClient = useQueryClient();

  const updateCourseMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.update(course.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['course']);
      toast.success('Settings updated!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    updateCourseMutation.mutate({
      status: formData.get('status'),
      visibility: formData.get('visibility'),
      drip_enabled: formData.get('drip_enabled') === 'on'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Course Status</Label>
            <Select name="status" defaultValue={course.status || 'draft'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select name="visibility" defaultValue={course.visibility || 'school_only'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school_only">School Only</SelectItem>
                <SelectItem value="public_unlisted">Public (Unlisted)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label>Drip Scheduling</Label>
              <p className="text-sm text-slate-500">
                Release lessons on a schedule
              </p>
            </div>
            <Switch name="drip_enabled" defaultChecked={course.drip_enabled} />
          </div>

          <Button type="submit" className="w-full">Save Settings</Button>
        </form>
      </CardContent>
    </Card>
  );
}