import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Bookmark, HelpCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function VideoAnnotations({ lessonId, currentTime, userEmail, annotations = [] }) {
  const [content, setContent] = useState('');
  const [type, setType] = useState('note');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.VideoAnnotation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['annotations']);
      setContent('');
      toast.success('Annotation added!');
    }
  });

  const handleAdd = () => {
    createMutation.mutate({
      lesson_id: lessonId,
      user_email: userEmail,
      timestamp_seconds: Math.floor(currentTime),
      content,
      type
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Notes & Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button
            variant={type === 'note' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('note')}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Note
          </Button>
          <Button
            variant={type === 'question' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('question')}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Question
          </Button>
          <Button
            variant={type === 'bookmark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('bookmark')}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Bookmark
          </Button>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Add a ${type} at ${Math.floor(currentTime)}s...`}
          rows={3}
        />
        <Button onClick={handleAdd} disabled={!content.trim()}>
          Add Annotation
        </Button>

        <div className="space-y-3 mt-6 max-h-96 overflow-y-auto">
          {annotations.map((annotation) => (
            <div key={annotation.id} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">
                  {Math.floor(annotation.timestamp_seconds / 60)}:{(annotation.timestamp_seconds % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-slate-500">{annotation.type}</span>
              </div>
              <p className="text-sm">{annotation.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}