import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function WriteMode({ terms, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const currentTerm = terms[currentIndex];

  const checkAnswer = () => {
    const correct = userAnswer.trim().toLowerCase() === currentTerm.term.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore(score + 1);
  };

  const nextTerm = () => {
    if (currentIndex < terms.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowResult(false);
    } else {
      onComplete?.({ score, total: terms.length });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between text-sm text-slate-600">
        <span>Question {currentIndex + 1} of {terms.length}</span>
        <span>Score: {score}/{terms.length}</span>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-600 mb-2">Write the term for:</p>
            <h3 className="text-3xl font-bold text-slate-900">{currentTerm.definition}</h3>
          </div>

          {!showResult ? (
            <div className="space-y-4">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="Type your answer..."
                className="text-lg text-center"
                autoFocus
                dir={currentTerm.language?.includes('hebrew') || currentTerm.language === 'aramaic' ? 'rtl' : 'ltr'}
              />
              <Button onClick={checkAnswer} className="w-full" disabled={!userAnswer.trim()}>
                Check Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <span className={`font-bold ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                {!isCorrect && (
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Correct answer:</p>
                    <p className="text-xl font-bold text-slate-900" dir="rtl">{currentTerm.term}</p>
                  </div>
                )}
              </div>
              <Button onClick={nextTerm} className="w-full">
                {currentIndex < terms.length - 1 ? 'Next' : 'Finish'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}