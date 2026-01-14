import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Volume2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlashcardPractice({ vocabulary, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState([]);
  const [needsReview, setNeedsReview] = useState([]);

  const currentWord = vocabulary[currentIndex];

  const handleNext = (known) => {
    if (known) {
      setMastered([...mastered, currentWord.word]);
    } else {
      setNeedsReview([...needsReview, currentWord.word]);
    }

    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      onComplete?.({ mastered: mastered.length + (known ? 1 : 0), total: vocabulary.length });
    }
  };

  const playAudio = () => {
    if (currentWord.audio_url) {
      const audio = new Audio(currentWord.audio_url);
      audio.play();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Card {currentIndex + 1} of {vocabulary.length}</span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
            {mastered.length} mastered
          </span>
          <span className="flex items-center">
            <XCircle className="w-4 h-4 text-orange-600 mr-1" />
            {needsReview.length} review
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / vocabulary.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Card 
            className="h-96 cursor-pointer shadow-2xl"
            onClick={() => setFlipped(!flipped)}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8 relative">
              {!flipped ? (
                // Front - Hebrew word
                <div className="text-center" style={{ backfaceVisibility: 'hidden' }}>
                  <div className="text-7xl font-bold text-slate-900 mb-6" dir="rtl">
                    {currentWord.word}
                  </div>
                  <p className="text-2xl text-slate-600 mb-4">
                    {currentWord.transliteration}
                  </p>
                  {currentWord.audio_url && (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio();
                      }}
                      variant="outline"
                      className="mt-4"
                    >
                      <Volume2 className="w-5 h-5 mr-2" />
                      Pronounce
                    </Button>
                  )}
                  <p className="text-slate-500 text-sm mt-8">Click to reveal translation</p>
                </div>
              ) : (
                // Back - Translation
                <div 
                  className="text-center" 
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                  }}
                >
                  <div className="text-5xl font-bold text-blue-900 mb-4">
                    {currentWord.translation}
                  </div>
                  {currentWord.example_sentence && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-slate-700 italic">
                        "{currentWord.example_sentence}"
                      </p>
                    </div>
                  )}
                  {currentWord.grammar_notes && (
                    <p className="text-sm text-slate-600 mt-4">
                      💡 {currentWord.grammar_notes}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      {flipped && (
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => handleNext(false)}
            variant="outline"
            className="flex-1 max-w-xs border-orange-400 text-orange-600 hover:bg-orange-50"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Need Review
          </Button>
          <Button
            onClick={() => handleNext(true)}
            className="flex-1 max-w-xs bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            I Know This
          </Button>
        </div>
      )}
    </div>
  );
}