import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Sparkles } from 'lucide-react';

export default function PricingCard({ tier, isCurrentTier, onSubscribe }) {
  const tiers = {
    free: {
      name: 'Free',
      price: 0,
      period: '',
      description: 'Start your Torah learning journey',
      icon: Sparkles,
      color: 'from-slate-500 to-slate-600',
      features: [
        'Access to free courses',
        'Selected preview lessons',
        'Basic progress tracking',
        'Community access'
      ]
    },
    premium: {
      name: 'Premium',
      price: 18,
      period: '/month',
      description: 'Unlock the full library',
      icon: Crown,
      color: 'from-blue-500 to-blue-600',
      badge: 'Most Popular',
      features: [
        'All free tier features',
        'Full access to premium courses',
        'Downloadable audio lessons',
        'Study notes & resources',
        'Priority support',
        'Advanced progress tracking'
      ]
    },
    elite: {
      name: 'Elite',
      price: 36,
      period: '/month',
      description: 'The ultimate learning experience',
      icon: Crown,
      color: 'from-amber-500 to-amber-600',
      badge: 'Best Value',
      features: [
        'All premium tier features',
        'Exclusive elite-only courses',
        'Live Q&A sessions with Rabbis',
        'Private study groups',
        'Early access to new content',
        'Personal learning consultation',
        'Certificate of completion'
      ]
    }
  };

  const config = tiers[tier];
  const Icon = config.icon;

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-2xl ${
      isCurrentTier ? 'ring-2 ring-amber-500 shadow-xl' : ''
    }`}>
      {config.badge && (
        <div className="absolute top-4 right-4">
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {config.badge}
          </span>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">{config.name}</CardTitle>
        <p className="text-sm text-slate-600 mt-2">{config.description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="flex items-baseline justify-center">
            <span className="text-5xl font-bold text-slate-900">${config.price}</span>
            <span className="text-slate-600 ml-2">{config.period}</span>
          </div>
          {config.price > 0 && (
            <p className="text-xs text-slate-500 mt-2">Billed monthly • Cancel anytime</p>
          )}
        </div>

        <div className="space-y-3">
          {config.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => onSubscribe(tier)}
          disabled={isCurrentTier}
          className={`w-full ${
            isCurrentTier
              ? 'bg-slate-300 cursor-not-allowed'
              : `bg-gradient-to-r ${config.color} hover:shadow-lg`
          } text-white font-semibold`}
        >
          {isCurrentTier ? 'Current Plan' : `Get ${config.name}`}
        </Button>
      </CardContent>
    </Card>
  );
}