import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, TrendingUp, Award } from 'lucide-react';

export default function SalaryNegotiator() {
  const [offer, setOffer] = useState('');
  const [target, setTarget] = useState('');

  const calculateCounterOffer = () => {
    const offerNum = parseFloat(offer);
    const targetNum = parseFloat(target);
    const recommended = offerNum + ((targetNum - offerNum) * 0.7);
    return recommended.toFixed(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Salary Negotiation Tool</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Offer ($)</label>
          <Input
            type="number"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            placeholder="75000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Target Salary ($)</label>
          <Input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="90000"
          />
        </div>

        {offer && target && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-bold">Recommended Counter-Offer</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">${calculateCounterOffer()}</p>
            <p className="text-sm text-slate-600 mt-2">
              This gives you negotiation room while showing flexibility
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Negotiation Points</label>
          <Textarea
            placeholder="• Market research shows average is $X&#10;• I bring Y years of experience&#10;• My skills in Z are in high demand"
            rows={4}
          />
        </div>

        <Button className="w-full">Save Negotiation Plan</Button>
      </CardContent>
    </Card>
  );
}