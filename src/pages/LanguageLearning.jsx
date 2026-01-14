import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, TrendingUp } from 'lucide-react';

export default function LanguageLearning() {
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

  const { data: variants = [] } = useQuery({
    queryKey: ['language-variants', activeSchoolId],
    queryFn: () => base44.entities.LanguageVariant.filter({
      school_id: activeSchoolId,
      enabled: true
    }),
    enabled: !!activeSchoolId
  });

  const { data: mySets = [] } = useQuery({
    queryKey: ['my-study-sets', user?.email, activeSchoolId],
    queryFn: () => base44.entities.StudySet.filter({
      school_id: activeSchoolId,
      creator_user: user.email
    }),
    enabled: !!user && !!activeSchoolId
  });

  const { data: schoolSets = [] } = useQuery({
    queryKey: ['school-study-sets', activeSchoolId],
    queryFn: () => base44.entities.StudySet.filter({
      school_id: activeSchoolId,
      visibility: { $in: ['SCHOOL', 'PUBLIC_WITHIN_SCHOOL'] }
    }),
    enabled: !!activeSchoolId
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Language Learning</h1>
          <p className="text-slate-600 mt-2">Master Hebrew, Aramaic, and more</p>
        </div>
        <Link to={createPageUrl('StudySetNew')}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Study Set
          </Button>
        </Link>
      </div>

      {/* Language Variants */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Languages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {variants.map((variant) => (
            <Card key={variant.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">{variant.label}</h3>
                <Link to={createPageUrl(`LanguageStudy?variant=${variant.key}`)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Start Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        {variants.length === 0 && (
          <p className="text-slate-500 text-center py-8">No languages enabled yet</p>
        )}
      </div>

      {/* My Study Sets */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Study Sets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mySets.map((set) => (
            <Card key={set.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{set.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{set.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{set.visibility}</Badge>
                  <Link to={createPageUrl(`StudySetPractice?id=${set.id}`)}>
                    <Button size="sm">Study</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {mySets.length === 0 && (
          <p className="text-slate-500 text-center py-8">No study sets yet</p>
        )}
      </div>

      {/* School Study Sets */}
      <div>
        <h2 className="text-2xl font-bold mb-4">School Study Sets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schoolSets.slice(0, 6).map((set) => (
            <Card key={set.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{set.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{set.description}</p>
                <Link to={createPageUrl(`StudySetPractice?id=${set.id}`)}>
                  <Button size="sm" className="w-full">Study</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}