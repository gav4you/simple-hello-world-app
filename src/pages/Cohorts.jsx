import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, BookOpen } from 'lucide-react';

export default function Cohorts() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: myCohorts = [] } = useQuery({
    queryKey: ['my-cohorts', user?.email, activeSchoolId],
    queryFn: async () => {
      const memberships = await base44.entities.CohortMember.filter({
        school_id: activeSchoolId,
        user_email: user.email
      });
      
      const cohortIds = memberships.map(m => m.cohort_id);
      const cohorts = [];
      
      for (const id of cohortIds) {
        const cohort = await base44.entities.Cohort.filter({ id });
        if (cohort[0]) cohorts.push(cohort[0]);
      }
      
      return cohorts;
    },
    enabled: !!user && !!activeSchoolId
  });

  const { data: allCohorts = [] } = useQuery({
    queryKey: ['all-cohorts', activeSchoolId],
    queryFn: () => base44.entities.Cohort.filter({
      school_id: activeSchoolId,
      status: 'active'
    }),
    enabled: !!activeSchoolId
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Cohorts & Classes</h1>
        <p className="text-slate-600">Structured semester-style learning experiences</p>
      </div>

      {/* My Cohorts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Cohorts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myCohorts.map((cohort) => (
            <Card key={cohort.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{cohort.name}</CardTitle>
                    <Badge variant={cohort.status === 'active' ? 'default' : 'secondary'}>
                      {cohort.status}
                    </Badge>
                  </div>
                  <Users className="w-6 h-6 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(cohort.start_date).toLocaleDateString()} - {new Date(cohort.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Instructor: {cohort.instructor_user}
                  </div>
                </div>
                <Link to={createPageUrl(`CohortDetail?id=${cohort.id}`)}>
                  <Button className="w-full">View Cohort</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        {myCohorts.length === 0 && (
          <p className="text-slate-500 text-center py-8">You're not enrolled in any cohorts yet</p>
        )}
      </div>

      {/* Available Cohorts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Cohorts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allCohorts.filter(c => !myCohorts.find(mc => mc.id === c.id)).map((cohort) => (
            <Card key={cohort.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{cohort.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Starts: {new Date(cohort.start_date).toLocaleDateString()}
                  </div>
                  {cohort.capacity && (
                    <p>Capacity: {cohort.capacity} students</p>
                  )}
                </div>
                <Button className="w-full" variant="outline">Request to Join</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}