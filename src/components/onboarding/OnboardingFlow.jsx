import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle } from 'lucide-react';

export default function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({});

  const steps = [
    { title: 'Welcome!', subtitle: 'Let\'s get you started' },
    { title: 'Tell us about yourself', subtitle: 'Help us personalize your experience' },
    { title: 'Choose your goals', subtitle: 'What do you want to learn?' },
    { title: 'Pick your first course', subtitle: 'Start your journey' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            {steps.map((_, idx) => (
              <div key={idx} className={`flex items-center ${idx < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  idx + 1 <= step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {idx + 1 < step ? <CheckCircle className="w-6 h-6" /> : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${idx + 1 < step ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold mb-2">{steps[step - 1].title}</h2>
          <p className="text-slate-600 mb-8">{steps[step - 1].subtitle}</p>

          <div className="space-y-4 mb-8">
            {step === 1 && <p className="text-center text-slate-700">Welcome to Breslov Academy! We're excited to have you.</p>}
            {step === 2 && <Input placeholder="What are your interests?" />}
            {step === 3 && <div className="grid grid-cols-2 gap-4">
              {['Torah Study', 'Prayer', 'Chassidus', 'Halacha'].map(goal => (
                <button key={goal} className="p-4 border rounded-lg hover:border-blue-600">{goal}</button>
              ))}
            </div>}
          </div>

          <div className="flex justify-between">
            {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
            <Button onClick={() => step < 4 ? setStep(step + 1) : onComplete?.()} className="ml-auto">
              {step < 4 ? 'Next' : 'Get Started'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}