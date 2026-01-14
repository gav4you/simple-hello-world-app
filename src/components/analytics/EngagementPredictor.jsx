import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function EngagementPredictor({ userEmail, data }) {
  const predictedData = data || [
    { week: 'W1', actual: 85, predicted: null },
    { week: 'W2', actual: 78, predicted: null },
    { week: 'W3', actual: 82, predicted: null },
    { week: 'W4', actual: 75, predicted: null },
    { week: 'W5', actual: null, predicted: 73 },
    { week: 'W6', actual: null, predicted: 70 },
    { week: 'W7', actual: null, predicted: 68 },
    { week: 'W8', actual: null, predicted: 65 }
  ];

  const trend = predictedData[predictedData.length - 1]?.predicted < 70 ? 'declining' : 'stable';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Engagement Forecast</span>
          {trend === 'declining' ? (
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={predictedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" label="At Risk" />
            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="predicted" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-700">
            {trend === 'declining' ? (
              <>
                <AlertTriangle className="w-4 h-4 inline mr-2 text-orange-600" />
                Engagement declining. Consider reaching out to the student.
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />
                Engagement remains healthy. Keep monitoring.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}