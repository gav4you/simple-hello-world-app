import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Heart, Moon, Battery } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function WellnessTracker({ userEmail }) {
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [mood, setMood] = useState('okay');
  const [sleep, setSleep] = useState(7);

  const handleSubmit = async () => {
    try {
      await base44.entities.WellnessCheck.create({
        user_email: userEmail,
        date: new Date().toISOString().split('T')[0],
        stress_level: stress,
        energy_level: energy,
        mood,
        sleep_hours: sleep
      });
      toast.success('Wellness check recorded!');
    } catch (error) {
      toast.error('Failed to save wellness check');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500" />
          <span>Daily Wellness Check</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Stress Level</span>
            <span className="text-sm text-slate-600">{stress}/10</span>
          </label>
          <Slider value={[stress]} onValueChange={(v) => setStress(v[0])} max={10} step={1} />
        </div>

        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center">
              <Battery className="w-4 h-4 mr-2" />
              Energy Level
            </span>
            <span className="text-sm text-slate-600">{energy}/10</span>
          </label>
          <Slider value={[energy]} onValueChange={(v) => setEnergy(v[0])} max={10} step={1} />
        </div>

        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center">
              <Moon className="w-4 h-4 mr-2" />
              Sleep Hours
            </span>
            <span className="text-sm text-slate-600">{sleep}h</span>
          </label>
          <Slider value={[sleep]} onValueChange={(v) => setSleep(v[0])} max={12} step={0.5} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">How are you feeling?</label>
          <div className="flex space-x-2">
            {['great', 'good', 'okay', 'stressed', 'overwhelmed'].map((m) => (
              <Button
                key={m}
                variant={mood === m ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMood(m)}
              >
                {m}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full">Save Wellness Check</Button>
      </CardContent>
    </Card>
  );
}