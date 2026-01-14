import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';

export default function MatchGame({ terms, onComplete }) {
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [startTime] = useState(Date.now());
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    // Create pairs of term and definition cards
    const gameCards = [];
    terms.slice(0, 6).forEach((term, idx) => {
      gameCards.push({ id: `term-${idx}`, text: term.term, pairId: idx, type: 'term' });
      gameCards.push({ id: `def-${idx}`, text: term.definition, pairId: idx, type: 'definition' });
    });
    
    // Shuffle
    setCards(gameCards.sort(() => Math.random() - 0.5));
  }, [terms]);

  const handleCardClick = (card) => {
    if (selected.length === 2 || matched.includes(card.id) || selected.find(s => s.id === card.id)) {
      return;
    }

    const newSelected = [...selected, card];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      // Check if match
      if (newSelected[0].pairId === newSelected[1].pairId) {
        setMatched([...matched, newSelected[0].id, newSelected[1].id]);
        setSelected([]);
        
        // Check if game complete
        if (matched.length + 2 === cards.length) {
          const timeTaken = Math.round((Date.now() - startTime) / 1000);
          setGameComplete(true);
          onComplete?.({ time: timeTaken, moves: Math.ceil((matched.length + 2) / 2) });
        }
      } else {
        setTimeout(() => setSelected([]), 800);
      }
    }
  };

  const reset = () => {
    setSelected([]);
    setMatched([]);
    setGameComplete(false);
    setCards(cards.sort(() => Math.random() - 0.5));
  };

  if (gameComplete) {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    return (
      <div className="text-center py-12">
        <Trophy className="w-20 h-20 text-amber-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Perfect Match!</h2>
        <p className="text-slate-600 text-lg mb-6">
          Completed in {timeTaken} seconds
        </p>
        <Button onClick={reset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-600">Match the terms with their definitions</p>
        <p className="font-semibold">{matched.length / 2} / {cards.length / 2} matched</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const isSelected = selected.find(s => s.id === card.id);
          const isMatched = matched.includes(card.id);
          
          return (
            <motion.div
              key={card.id}
              whileHover={{ scale: isMatched ? 1 : 1.05 }}
              whileTap={{ scale: isMatched ? 1 : 0.95 }}
            >
              <Card
                onClick={() => handleCardClick(card)}
                className={`p-4 min-h-32 flex items-center justify-center text-center cursor-pointer transition-all ${
                  isMatched ? 'bg-green-100 border-green-400 opacity-50' :
                  isSelected ? 'bg-blue-100 border-blue-400 scale-105' :
                  'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <p className={`font-medium ${card.type === 'term' ? 'text-lg' : 'text-base'}`}>
                  {card.text}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}