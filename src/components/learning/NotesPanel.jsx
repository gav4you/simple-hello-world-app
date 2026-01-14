import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StickyNote, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function NotesPanel({ lesson, user }) {
  const [noteBody, setNoteBody] = useState('');
  const [shareWithCourse, setShareWithCourse] = useState(false);
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ['lesson-notes', lesson.id, user.email],
    queryFn: () => base44.entities.LessonNote.filter({
      lesson_id: lesson.id,
      user_email: user.email
    }),
    enabled: !!lesson && !!user,
    onSuccess: (data) => {
      if (data.length > 0) {
        setNoteBody(data[0].body);
        setShareWithCourse(data[0].visibility === 'COURSE');
      }
    }
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (data) => {
      if (notes.length > 0) {
        return await base44.entities.LessonNote.update(notes[0].id, data);
      } else {
        return await base44.entities.LessonNote.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-notes']);
      toast.success('Note saved!');
    }
  });

  const handleSave = () => {
    saveNoteMutation.mutate({
      school_id: lesson.school_id,
      lesson_id: lesson.id,
      user_email: user.email,
      body: noteBody,
      visibility: shareWithCourse ? 'COURSE' : 'PRIVATE'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <StickyNote className="w-5 h-5 mr-2" />
          My Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          placeholder="Take notes while learning..."
          rows={8}
          className="resize-none"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="share-notes"
              checked={shareWithCourse}
              onCheckedChange={setShareWithCourse}
            />
            <Label htmlFor="share-notes" className="text-sm">Share with course</Label>
          </div>
          
          <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}