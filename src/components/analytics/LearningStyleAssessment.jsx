import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Eye, Ear, Hand, BookOpen } from 'lucide-react';

export default function LearningStyleAssessment({ onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState({ visual: 0, auditory: 0, kinesthetic: 0, reading: 0 });

  const questions = [
    { q: "When learning something new, I prefer to:", options: [
      { text: "Watch videos or diagrams", style: "visual" },
      { text: "Listen to explanations", style: "auditory" },
      { text: "Try it hands-on", style: "kinesthetic" },
      { text: "Read about it", style: "reading" }
    ]},
    { q: "I remember things best when:", options: [
      { text: "I can visualize them", style: "visual" },
      { text: "I hear them explained", style: "auditory" },
      { text: "I practice doing them", style: "kinesthetic" },
      { text: "I write them down", style: "reading" }
    ]},
    { q: "In a lecture, I:", options: [
      { text: "Focus on visual aids", style: "visual" },
      { text: "Listen carefully", style: "auditory" },
      { text: "Take practice notes", style: "kinesthetic" },
      { text: "Write detailed notes", style: "reading" }
    ]}
  ];

  const handleAnswer = (style) => {
    setScores({ ...scores, [style]: scores[style] + 1 });
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const primary = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
      onComplete?.(primary, scores);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span>Learning Style Assessment</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={(currentQ / questions.length) * 100} className="mb-6" />
        <h3 className="font-bold text-lg mb-4">{questions[currentQ].q}</h3>
        <div className="space-y-3">
          {questions[currentQ].options.map((opt, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAnswer(opt.style)}
            >
              {opt.text}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}