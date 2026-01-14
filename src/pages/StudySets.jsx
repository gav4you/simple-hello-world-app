import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StudySets() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: studySets = [] } = useQuery({
    queryKey: ['study-sets'],
    queryFn: () => base44.entities.StudySet.filter({ is_public: true }, '-created_date', 50)
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Study Sets</h1>
            <p className="text-purple-200 text-lg">Quizlet-style learning tools</p>
          </div>
          <Button className="bg-white text-purple-900 hover:bg-purple-50">
            <Plus className="w-5 h-5 mr-2" />
            Create Set
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {studySets.map((set) => (
          <Link key={set.id} to={createPageUrl(`StudySet?id=${set.id}`)}>
            <Card className="hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{set.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{set.description}</p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{set.terms?.length || 0} terms</span>
                  <span>{set.total_studies || 0} studies</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}