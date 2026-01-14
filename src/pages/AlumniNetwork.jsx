import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, LinkedinIcon, Award } from 'lucide-react';

export default function AlumniNetwork() {
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

  const { data: alumni = [] } = useQuery({
    queryKey: ['alumni'],
    queryFn: () => base44.entities.Alumni.filter({ open_to_networking: true })
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Users className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Alumni Network</h1>
            <p className="text-blue-200 text-lg">Connect with successful graduates</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.map((alum) => (
          <Card key={alum.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {alum.user_email?.[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold">{alum.user_email}</h3>
                  <p className="text-sm text-slate-600">{alum.current_position}</p>
                  <p className="text-xs text-slate-500">{alum.company}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <Badge>{alum.graduation_year}</Badge>
                {alum.willing_to_mentor && (
                  <Badge className="bg-green-100 text-green-800">Mentor</Badge>
                )}
              </div>
              {alum.success_story && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{alum.success_story}</p>
              )}
              <div className="flex space-x-2">
                {alum.linkedin_url && (
                  <Button size="sm" variant="outline" className="flex-1">
                    <LinkedinIcon className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                )}
                <Button size="sm" className="flex-1">Connect</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}