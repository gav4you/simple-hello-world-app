import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}