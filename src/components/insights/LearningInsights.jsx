import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, Lightbulb, Award, Target } from 'lucide-react';

export default function LearningInsights({ insights }) {
  const iconMap = {
    strength: Award,
    weakness: AlertCircle,
    recommendation: Lightbulb,
    milestone: Target,
    prediction: TrendingUp
  };

  const colorMap = {
    strength: 'bg-green-100 text-green-800 border-green-300',
    weakness: 'bg-red-100 text-red-800 border-red-300',
    recommendation: 'bg-blue-100 text-blue-800 border-blue-300',
    milestone: 'bg-purple-100 text-purple-800 border-purple-300',
    prediction: 'bg-amber-100 text-amber-800 border-amber-300'
  };

  return (
    <div className="space-y-4">
      {insights?.map((insight) => {
        const Icon = iconMap[insight.insight_type] || Lightbulb;
        const colorClass = colorMap[insight.insight_type] || 'bg-slate-100';

        return (
          <Card key={insight.id} className={`border-l-4 ${colorClass}`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Icon className="w-5 h-5 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant="outline" className="capitalize">
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{insight.description}</p>
                  {insight.action_items?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Action Items:</p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {insight.action_items.map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}