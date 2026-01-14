import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function StudySetPractice() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [mode, setMode] = useState('FLASHCARDS');
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const setId = urlParams.get('id');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: studySet } = useQuery({
    queryKey: ['study-set', setId],
    queryFn: async () => {
      const sets = await base44.entities.StudySet.filter({ id: setId });
      return sets[0];
    },
    enabled: !!setId
  });

  const { data: cards = [] } = useQuery({
    queryKey: ['study-cards', setId],
    queryFn: () => base44.entities.StudyCard.filter({ study_set_id: setId }, 'order'),
    enabled: !!setId
  });

  const recordSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.StudySession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['study-sessions']);
    }
  });

  const handleNext = () => {
    setShowBack(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Session complete
      recordSessionMutation.mutate({
        school_id: activeSchoolId,
        user_email: user.email,
        study_set_id: setId,
        mode: 'FLASHCARDS',
        score: 100,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString()
      });
      toast.success('Study session complete!');
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setShowBack(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!studySet || cards.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">Loading study set...</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{studySet.title}</h1>
        <div className="flex items-center space-x-4">
          <span className="text-slate-600">{cards.length} cards</span>
          <Progress value={progress} className="flex-1" />
          <span className="text-sm text-slate-600">{currentIndex + 1}/{cards.length}</span>
        </div>
      </div>

      {/* Flashcard */}
      <Card 
        className="mb-8 cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => setShowBack(!showBack)}
      >
        <CardContent className="p-12 min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold mb-4">
              {showBack ? currentCard.back : currentCard.front}
            </p>
            {!showBack && (
              <p className="text-sm text-slate-500">Click to reveal answer</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={() => {
            setCurrentIndex(0);
            setShowBack(false);
          }}
          variant="outline"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart
        </Button>

        <Button onClick={handleNext}>
          {currentIndex === cards.length - 1 ? 'Finish' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}