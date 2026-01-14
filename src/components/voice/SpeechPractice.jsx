import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, Volume2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function SpeechPractice({ phrase, onComplete }) {
  const [recording, setRecording] = useState(false);
  const [score, setScore] = useState(null);
  const audioRef = useRef(null);

  const startRecording = () => {
    setRecording(true);
    // In real implementation, start recording
  };

  const stopRecording = () => {
    setRecording(false);
    // In real implementation, stop and analyze
    const mockScore = Math.floor(Math.random() * 30) + 70;
    setScore(mockScore);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pronunciation Practice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-lg font-medium mb-2">{phrase.text}</p>
          <p className="text-sm text-slate-600">{phrase.translation}</p>
          <Button size="sm" variant="ghost" className="mt-2">
            <Volume2 className="w-4 h-4 mr-2" />
            Listen
          </Button>
        </div>

        <div className="text-center">
          <Button
            onClick={recording ? stopRecording : startRecording}
            className={recording ? 'bg-red-600 hover:bg-red-700' : ''}
            size="lg"
          >
            {recording ? (
              <>
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        </div>

        {score !== null && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Accuracy</span>
              <span className="text-sm font-bold">{score}%</span>
            </div>
            <Progress value={score} />
            <p className="text-sm text-slate-600 mt-2">
              {score >= 80 ? 'Excellent pronunciation!' : 'Keep practicing!'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}