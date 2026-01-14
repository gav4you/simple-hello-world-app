import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown } from 'lucide-react';
import { scopedFilter } from '../api/scoped';

export default function ConversionFunnel({ schoolId, dateRange }) {
  const { data: events = [] } = useQuery({
    queryKey: ['analytics-events', schoolId, dateRange],
    queryFn: () => scopedFilter('AnalyticsEvent', schoolId, {}, '-created_date', 1000),
    enabled: !!schoolId
  });

  const counts = {
    landing: events.filter(e => e.event_type === 'viewed_landing').length,
    sales: events.filter(e => e.event_type === 'viewed_course_sales').length,
    checkout: events.filter(e => e.event_type === 'started_checkout').length,
    purchase: events.filter(e => e.event_type === 'completed_purchase').length
  };

  const stages = [
    { label: 'Landing Views', count: counts.landing, color: 'bg-blue-500' },
    { label: 'Course Sales Views', count: counts.sales, color: 'bg-indigo-500' },
    { label: 'Checkouts Started', count: counts.checkout, color: 'bg-purple-500' },
    { label: 'Purchases Completed', count: counts.purchase, color: 'bg-green-500' }
  ];

  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, idx) => {
            const width = (stage.count / maxCount) * 100;
            const conversionRate = idx > 0 && stages[idx - 1].count > 0
              ? ((stage.count / stages[idx - 1].count) * 100).toFixed(1)
              : null;

            return (
              <div key={stage.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{stage.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">{stage.count}</span>
                    {conversionRate && (
                      <span className="text-xs text-green-600">({conversionRate}%)</span>
                    )}
                  </div>
                </div>
                <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stage.color} transition-all duration-500`}
                    style={{ width: `${width}%` }}
                  />
                </div>
                {idx < stages.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowDown className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}