import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Award, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/components/hooks/useSession';
import { recordQuizAttempt } from '@/components/academic/quizEngine';

export default function QuizCard({
  quiz,
  questions: questionsProp,
  user,
  userEmail,
  schoolId,
  access = 'FULL',
  onComplete,
}) {
  const { activeSchoolId } = useSession();

  const effectiveSchoolId = schoolId || quiz?.school_id || activeSchoolId || null;
  const email = userEmail || user?.email || '';

  const questions = useMemo(() => {
    const list = questionsProp || quiz?.questions || [];
    return Array.isArray(list) ? list : [];
  }, [questionsProp, quiz]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const question = questions[currentQuestion];

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setStartTime(Date.now());
  };

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!email) {
      toast.error('Please sign in to submit this quiz');
      return;
    }

    let correctCount = 0;
    const attemptAnswers = [];

    questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      const correctAnswer = q.correct_answer ?? q.correctAnswer ?? '';
      const isCorrect = userAnswer === correctAnswer;
      if (isCorrect) correctCount++;

      attemptAnswers.push({
        question_index: idx,
        answer: userAnswer || '',
        is_correct: isCorrect,
      });
    });

    const scorePercentage = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
    const passing = quiz?.passing_score ?? 70;
    const passed = scorePercentage >= passing;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    setScore(scorePercentage);
    setShowResults(true);

    try {
      if (effectiveSchoolId) {
        await recordQuizAttempt({
          schoolId: effectiveSchoolId,
          quizId: quiz?.id,
          userEmail: email,
          score: scorePercentage,
          passed,
          answers: attemptAnswers,
          timeTakenSeconds: timeTaken,
        });
      }
    } catch (e) {
      // Attempt storage failure should not block UX.
      console.warn('QuizAttempt create failed', e);
    }

    if (passed) {
      toast.success('Congratulations! You passed the quiz!');
      onComplete?.();
    } else {
      toast.error('You can try again to improve your score');
    }
  };

  const normalizedAccess = String(access || '').toUpperCase();

  if (normalizedAccess === 'LOCKED') {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-2">
          <div className="text-lg font-semibold">This quiz is locked</div>
          <div className="text-sm text-muted-foreground">Enroll in the course or upgrade to access this quiz.</div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader className="text-center">
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              score >= (quiz?.passing_score || 70) ? 'bg-green-100' : 'bg-orange-100'
            }`}
          >
            {score >= (quiz?.passing_score || 70) ? (
              <Award className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-orange-600" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">
            {score >= (quiz?.passing_score || 70) ? 'Quiz Passed!' : 'Keep Practicing'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-5xl font-bold text-slate-900">{score}%</div>
          <p className="text-slate-600">
            You got {Math.round((score / 100) * questions.length)} out of {questions.length} correct
          </p>
          <p className="text-sm text-slate-500">Passing score: {quiz?.passing_score || 70}%</p>
          <div className="pt-2">
            <Button onClick={reset} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!question) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">No questions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">
            Question {currentQuestion + 1} of {questions.length}{' '}
            {normalizedAccess === 'PREVIEW' ? <span className="ml-2 text-amber-700">(Preview)</span> : null}
          </span>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{Math.round((Date.now() - startTime) / 1000)}s</span>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
        <CardTitle className="text-xl">{question.question || question.prompt}</CardTitle>
        {question.question_hebrew ? (
          <p className="text-amber-700 mt-2" dir="rtl">
            {question.question_hebrew}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswer}>
          <div className="space-y-3">
            {(question.options || question.choices || []).map((option, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RadioGroupItem value={option} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            type="button"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion]}
            className="bg-blue-600 hover:bg-blue-700"
            type="button"
          >
            {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
