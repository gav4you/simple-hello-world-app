import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Users, Calendar } from 'lucide-react';

export default function LiveStreams() {
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

  const { data: streams = [] } = useQuery({
    queryKey: ['live-streams'],
    queryFn: () => base44.entities.LiveStream.list('-scheduled_start')
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-red-900 to-pink-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Radio className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Live Streams</h1>
            <p className="text-red-200 text-lg">Join live classes and Q&A sessions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {streams.map((stream) => (
          <Card key={stream.id} className={stream.status === 'live' ? 'border-2 border-red-500' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{stream.title}</h3>
                  <Badge className={stream.status === 'live' ? 'bg-red-600 animate-pulse' : ''}>
                    {stream.status === 'live' ? '🔴 LIVE' : stream.status}
                  </Badge>
                </div>
                <Radio className={`w-8 h-8 ${stream.status === 'live' ? 'text-red-600' : 'text-slate-400'}`} />
              </div>
              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(stream.scheduled_start).toLocaleString()}</span>
                </div>
                {stream.status === 'live' && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{stream.viewer_count} watching now</span>
                  </div>
                )}
              </div>
              <Button className="w-full" disabled={stream.status !== 'live'}>
                {stream.status === 'live' ? 'Join Stream' : 'Set Reminder'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}