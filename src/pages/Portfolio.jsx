import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Eye } from 'lucide-react';

export default function Portfolio() {
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');

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

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio', email],
    queryFn: async () => {
      const portfolios = await base44.entities.Portfolio.filter({ user_email: email || user?.email });
      return portfolios[0];
    },
    enabled: !!(email || user?.email)
  });

  if (!portfolio) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">{portfolio.title || 'My Portfolio'}</h1>
        <p className="text-blue-200">{portfolio.description}</p>
        <div className="flex items-center space-x-2 mt-4 text-sm">
          <Eye className="w-4 h-4" />
          <span>{portfolio.views} views</span>
        </div>
      </div>

      {portfolio.skills?.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills.map((skill, idx) => (
                <Badge key={idx}>{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolio.projects?.map((project, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                <p className="text-slate-600 text-sm">{project.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}