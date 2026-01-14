import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FlashcardPractice from '../components/language/FlashcardPractice';
import MatchGame from '../components/study/MatchGame';
import WriteMode from '../components/study/WriteMode';

export default function StudySet() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const setId = urlParams.get('id');

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

  const { data: studySet } = useQuery({
    queryKey: ['study-set', setId],
    queryFn: async () => {
      const sets = await base44.entities.StudySet.filter({ id: setId });
      return sets[0];
    },
    enabled: !!setId
  });

  if (!studySet) return <div>Loading...</div>;

  if (mode) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setMode(null)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Study Modes
        </Button>
        {mode === 'flashcard' && (
          <FlashcardPractice
            vocabulary={studySet.terms.map(t => ({ word: t.term, translation: t.definition, audio_url: t.audio_url }))}
            onComplete={() => setMode(null)}
          />
        )}
        {mode === 'match' && (
          <MatchGame terms={studySet.terms} onComplete={() => setMode(null)} />
        )}
        {mode === 'write' && (
          <WriteMode terms={studySet.terms} onComplete={() => setMode(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link to={createPageUrl('StudySets')}>
        <Button variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          All Study Sets
        </Button>
      </Link>

      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">{studySet.title}</h1>
        <p className="text-blue-200 text-lg">{studySet.description}</p>
        <p className="mt-4 text-blue-300">{studySet.terms?.length || 0} terms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setMode('flashcard')}>
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">🃏</div>
            <h3 className="font-bold text-xl mb-2">Flashcards</h3>
            <p className="text-slate-600">Classic flip-card study</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setMode('match')}>
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="font-bold text-xl mb-2">Match</h3>
            <p className="text-slate-600">Match terms with definitions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setMode('write')}>
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">✍️</div>
            <h3 className="font-bold text-xl mb-2">Write</h3>
            <p className="text-slate-600">Type the correct answer</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}