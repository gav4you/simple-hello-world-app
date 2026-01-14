import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, TrendingUp, Clock, DollarSign } from 'lucide-react';

export default function CareerPaths() {
  const { data: paths = [] } = useQuery({
    queryKey: ['career-paths'],
    queryFn: () => base44.entities.CareerPath.list()
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Briefcase className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Career Paths</h1>
            <p className="text-indigo-200 text-lg">Chart your professional journey</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paths.map((path) => (
          <Card key={path.id} className="hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{path.title}</h3>
                  <Badge>{path.difficulty}</Badge>
                </div>
                <Briefcase className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-slate-600 mb-4">{path.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center text-slate-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{path.estimated_duration_months} months</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>${path.average_salary?.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span>{path.job_outlook}</span>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {path.required_skills?.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="outline">{skill}</Badge>
                  ))}
                  {path.required_skills?.length > 3 && (
                    <Badge variant="outline">+{path.required_skills.length - 3} more</Badge>
                  )}
                </div>
              </div>
              <Button className="w-full">Explore Path</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}