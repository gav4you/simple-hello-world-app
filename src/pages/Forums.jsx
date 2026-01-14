import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Eye, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function Forums() {
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

  const { data: forums = [] } = useQuery({
    queryKey: ['forums'],
    queryFn: () => base44.entities.Forum.list('-created_date', 50)
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-violet-900 to-purple-900 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <MessageSquare className="w-16 h-16" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Community Forums</h1>
              <p className="text-violet-200 text-lg">Ask questions, share knowledge</p>
            </div>
          </div>
          <Button className="bg-white text-purple-900 hover:bg-slate-100">
            New Discussion
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {forums.map((forum) => (
          <Card key={forum.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold">{forum.title}</h3>
                    {forum.is_solved && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Solved
                      </Badge>
                    )}
                    {forum.is_pinned && (
                      <Badge className="bg-blue-100 text-blue-800">Pinned</Badge>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{forum.content?.slice(0, 150)}...</p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{forum.views}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      <span>{forum.replies_count} replies</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>{forum.upvotes} upvotes</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}