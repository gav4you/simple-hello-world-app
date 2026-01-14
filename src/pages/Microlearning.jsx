import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Microlearning() {
  const [user, setUser] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: microlessons = [] } = useQuery({
    queryKey: ['microlessons'],
    queryFn: () => base44.entities.Microlesson.list('order')
  });

  const completeMutation = useMutation({
    mutationFn: (lessonId) => {
      const lesson = microlessons.find(l => l.id === lessonId);
      return base44.entities.Microlesson.update(lessonId, {
        completion_count: (lesson.completion_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['microlessons']);
      toast.success('Micro-lesson completed!');
      setCurrentLesson(null);
      setShowQuiz(false);
    }
  });

  const handleComplete = () => {
    if (showQuiz) {
      completeMutation.mutate(currentLesson.id);
    } else {
      setShowQuiz(true);
    }
  };

  if (currentLesson) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
              <div className="flex items-center text-slate-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{currentLesson.duration_seconds}s</span>
              </div>
            </div>
            
            {!showQuiz ? (
              <>
                <div className="prose max-w-none mb-6">
                  <p>{currentLesson.content}</p>
                </div>
                {currentLesson.media_url && (
                  <video src={currentLesson.media_url} controls className="w-full rounded-lg mb-6" />
                )}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-bold mb-2">Key Takeaway:</h3>
                  <p>{currentLesson.key_takeaway}</p>
                </div>
                <Button onClick={handleComplete} className="w-full">Continue</Button>
              </>
            ) : (
              <>
                <h3 className="font-bold mb-4">{currentLesson.quiz_question?.question}</h3>
                <div className="space-y-2 mb-6">
                  {currentLesson.quiz_question?.options?.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={handleComplete}
                      className="w-full p-3 text-left border rounded-lg hover:bg-slate-50"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-cyan-900 to-blue-900 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Microlearning</h1>
        <p className="text-cyan-200 text-lg">Quick, bite-sized lessons you can complete in minutes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {microlessons.map((lesson) => (
          <Card key={lesson.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentLesson(lesson)}>
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">{lesson.title}</h3>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{lesson.duration_seconds}s</span>
                </div>
                <span>{lesson.completion_count} completed</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}