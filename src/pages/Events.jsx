import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Video, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Events() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.filter({ status: 'upcoming' }, 'start_time')
  });

  const registerMutation = useMutation({
    mutationFn: async (event) => {
      const registered = event.registered_emails || [];
      if (registered.includes(user.email)) {
        return await base44.entities.Event.update(event.id, {
          registered_emails: registered.filter(e => e !== user.email)
        });
      } else {
        return await base44.entities.Event.update(event.id, {
          registered_emails: [...registered, user.email]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Registration updated!');
    }
  });

  const isRegistered = (event) => {
    return event.registered_emails?.includes(user?.email);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Calendar className="w-12 h-12" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Live Events & Webinars</h1>
            <p className="text-blue-200 text-lg">Join live learning sessions with expert instructors</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => {
          const startDate = new Date(event.start_time);
          const registered = isRegistered(event);
          const spots = event.max_attendees - (event.registered_emails?.length || 0);

          return (
            <Card key={event.id} className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge className="bg-purple-600">{event.event_type}</Badge>
                  {registered && (
                    <Badge className="bg-green-600 flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Registered</span>
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                <p className="text-slate-600 mb-4">{event.description}</p>

                <div className="space-y-2 mb-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({event.duration_minutes} min)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{event.registered_emails?.length || 0} registered • {spots} spots left</span>
                  </div>
                </div>

                <Button
                  onClick={() => registerMutation.mutate(event)}
                  className={registered ? 'w-full bg-slate-600' : 'w-full bg-blue-600 hover:bg-blue-700'}
                >
                  {registered ? 'Unregister' : 'Register Now'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}