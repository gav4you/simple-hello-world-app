import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Video, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Community() {
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

  const { data: studyGroups = [] } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => base44.entities.StudyGroup.filter({ status: 'active' })
  });

  const { data: liveClasses = [] } = useQuery({
    queryKey: ['live-classes'],
    queryFn: () => base44.entities.LiveClass.list('-scheduled_date', 20)
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ is_published: true })
  });

  const upcomingClasses = liveClasses.filter(c => 
    c.status === 'upcoming' && new Date(c.scheduled_date) > new Date()
  );

  const myGroups = studyGroups.filter(g => 
    g.member_emails?.includes(user?.email) || g.creator_email === user?.email
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Community</h1>
            <p className="text-blue-200 text-lg mt-1">
              Connect, learn together, and grow as a kehilla
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="live-classes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="live-classes" className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Live Classes</span>
          </TabsTrigger>
          <TabsTrigger value="study-groups" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Study Groups</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Leaderboard</span>
          </TabsTrigger>
        </TabsList>

        {/* Live Classes */}
        <TabsContent value="live-classes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Live Classes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingClasses.map((liveClass) => (
              <Card key={liveClass.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl flex-1">{liveClass.title}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800">
                      {liveClass.access_tier}
                    </Badge>
                  </div>
                  {liveClass.title_hebrew && (
                    <p className="text-amber-700" dir="rtl">{liveClass.title_hebrew}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600">{liveClass.description}</p>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(liveClass.scheduled_date), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(liveClass.scheduled_date), 'h:mm a')} • {liveClass.duration_minutes} min
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>
                        With {liveClass.instructor}
                      </span>
                    </div>
                    {liveClass.max_participants && (
                      <div className="flex items-center space-x-2">
                        <span>
                          {liveClass.registered_count || 0} / {liveClass.max_participants} registered
                        </span>
                      </div>
                    )}
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Register for Class
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {upcomingClasses.length === 0 && (
            <Card className="bg-slate-50">
              <CardContent className="p-12 text-center">
                <Video className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">No upcoming live classes</p>
                <p className="text-slate-500 text-sm mt-2">Check back soon for new sessions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Study Groups */}
        <TabsContent value="study-groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Study Groups</h2>
            <Button>Create New Group</Button>
          </div>

          {myGroups.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">My Groups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myGroups.map((group) => {
                  const course = courses.find(c => c.id === group.course_id);
                  return (
                    <Card key={group.id} className="bg-green-50 border-green-200">
                      <CardContent className="p-6">
                        <h4 className="font-bold text-lg text-slate-900 mb-2">{group.name}</h4>
                        <p className="text-slate-600 text-sm mb-3">{group.description}</p>
                        {course && (
                          <p className="text-sm text-slate-500 mb-2">Course: {course.title}</p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            {group.member_emails?.length || 0} / {group.max_members} members
                          </span>
                          <Button size="sm" variant="outline">View Group</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">All Study Groups</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyGroups.filter(g => g.is_public).map((group) => {
                const course = courses.find(c => c.id === group.course_id);
                const isMember = group.member_emails?.includes(user?.email);
                const isFull = (group.member_emails?.length || 0) >= group.max_members;

                return (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-lg text-slate-900 mb-2">{group.name}</h4>
                      <p className="text-slate-600 text-sm mb-3">{group.description}</p>
                      {course && (
                        <p className="text-sm text-slate-500 mb-2">Course: {course.title}</p>
                      )}
                      {group.meeting_schedule && (
                        <p className="text-sm text-slate-500 mb-3">
                          Meets: {group.meeting_schedule}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          {group.member_emails?.length || 0} / {group.max_members} members
                        </span>
                        {!isMember && (
                          <Button size="sm" disabled={isFull}>
                            {isFull ? 'Full' : 'Join Group'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {studyGroups.length === 0 && (
            <Card className="bg-slate-50">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">No study groups yet</p>
                <p className="text-slate-500 text-sm mt-2 mb-4">Be the first to create one!</p>
                <Button>Create Study Group</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6" />
                <span>Top Learners This Month</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p>Leaderboard coming soon!</p>
                <p className="text-sm mt-2">Compete with fellow students and earn recognition</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}