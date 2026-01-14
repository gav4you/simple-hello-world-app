import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default function TeachCourseStudents({ course, schoolId }) {
  const { data: entitlements = [] } = useQuery({
    queryKey: ['course-entitlements', course.id],
    queryFn: async () => {
      // Get ALL_COURSES entitlements
      const allCourses = await base44.entities.Entitlement.filter({
        school_id: schoolId,
        type: 'ALL_COURSES'
      });
      
      // Get specific course entitlements
      const specific = await base44.entities.Entitlement.filter({
        school_id: schoolId,
        type: 'COURSE',
        course_id: course.id
      });
      
      return [...allCourses, ...specific];
    },
    enabled: !!course && !!schoolId
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['course-progress', course.id],
    queryFn: () => base44.entities.UserProgress.filter({ course_id: course.id }),
    enabled: !!course
  });

  // Unique students with entitlement
  const uniqueStudents = Array.from(
    new Map(entitlements.map(e => [e.user_email, e])).values()
  );

  const getStudentProgress = (email) => {
    const studentProgress = progress.filter(p => p.user_email === email);
    const completed = studentProgress.filter(p => p.completed).length;
    return { completed, total: studentProgress.length };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Student Roster</span>
          <Badge>{uniqueStudents.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {uniqueStudents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No students enrolled yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Students will appear here when they purchase access or receive entitlements
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {uniqueStudents.map((entitlement) => {
              const prog = getStudentProgress(entitlement.user_email);
              const percentage = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
              
              return (
                <div key={entitlement.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{entitlement.user_email}</p>
                    <p className="text-sm text-slate-500">
                      {entitlement.type === 'ALL_COURSES' ? 'Full Access' : 'Course Access'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{percentage}% Complete</p>
                    <p className="text-xs text-slate-500">
                      {prog.completed} / {prog.total} lessons
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}