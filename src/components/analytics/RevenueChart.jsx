import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { scopedFilter } from '../api/scoped';

export default function RevenueChart({ schoolId }) {
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', schoolId],
    queryFn: () => scopedFilter('Transaction', schoolId, { status: 'completed' }),
    enabled: !!schoolId
  });

  // Group by month
  const monthlyRevenue = {};
  transactions.forEach(t => {
    const date = new Date(t.created_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyRevenue[monthKey]) {
      monthlyRevenue[monthKey] = 0;
    }
    monthlyRevenue[monthKey] += (t.amount_cents / 100);
  });

  const chartData = Object.keys(monthlyRevenue)
    .sort()
    .slice(-6)
    .map(month => ({
      month,
      revenue: monthlyRevenue[month]
    }));

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount_cents / 100), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Revenue Trend</span>
          <span className="text-2xl font-bold text-green-600">
            ${totalRevenue.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar dataKey="revenue" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}