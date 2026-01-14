import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Mentorship() {
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

  const { data: myMentorships = [] } = useQuery({
    queryKey: ['mentorships', user?.email],
    queryFn: async () => {
      const asMentee = await base44.entities.Mentorship.filter({ mentee_email: user.email });
      const asMentor = await base44.entities.Mentorship.filter({ mentor_email: user.email });
      return [...asMentee, ...asMentor];
    },
    enabled: !!user?.email
  });

  const { data: availableMentors = [] } = useQuery({
    queryKey: ['available-mentors'],
    queryFn: () => base44.entities.User.filter({ role: 'admin' })
  });

  const requestMutation = useMutation({
    mutationFn: async (mentorEmail) => {
      return await base44.entities.Mentorship.create({
        mentor_email: mentorEmail,
        mentee_email: user.email,
        status: 'requested'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mentorships']);
      toast.success('Mentorship requested!');
    }
  });

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Users className="w-16 h-16" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Mentorship Program</h1>
            <p className="text-indigo-200 text-lg">Connect with experienced Torah scholars</p>
          </div>
        </div>
      </div>

      {myMentorships.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Mentorships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myMentorships.map((mentorship) => (
              <Card key={mentorship.id}>
                <CardContent className="p-6">
                  <Badge className="mb-3">{mentorship.status}</Badge>
                  <h3 className="font-bold text-lg mb-2">
                    {mentorship.mentor_email === user?.email ? 'Mentee' : 'Mentor'}: 
                    {mentorship.mentor_email === user?.email ? mentorship.mentee_email : mentorship.mentor_email}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3">
                    {mentorship.meetings_completed} meetings completed
                  </p>
                  {mentorship.next_meeting && (
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Next: {new Date(mentorship.next_meeting).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Mentors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableMentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">{mentor.full_name}</h3>
                <p className="text-slate-600 text-sm mb-4">{mentor.email}</p>
                <Button
                  onClick={() => requestMutation.mutate(mentor.email)}
                  className="w-full"
                >
                  Request Mentorship
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}