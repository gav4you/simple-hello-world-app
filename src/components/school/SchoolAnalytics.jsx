import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';

export default function SchoolAnalytics() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <TrendingUp className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Full Analytics Dashboard</h3>
        <p className="text-slate-600 mb-6">
          View comprehensive analytics including enrollments, revenue, and engagement metrics
        </p>
        <Link to={createPageUrl('SchoolAnalytics')}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Open Analytics Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}