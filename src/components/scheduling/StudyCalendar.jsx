import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function StudyCalendar({ userEmail }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: schedules = [] } = useQuery({
    queryKey: ['study-schedules', userEmail],
    queryFn: () => base44.entities.StudySchedule.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Study Calendar</span>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-medium text-slate-600">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const hasSession = schedules.some(s => 
              s.sessions?.some(session => 
                new Date(session.start_time).getDate() === day
              )
            );
            return (
              <button
                key={day}
                className={`p-2 rounded-lg text-sm hover:bg-blue-50 ${
                  hasSession ? 'bg-blue-100 font-bold' : ''
                } ${day === today.getDate() ? 'border-2 border-blue-600' : ''}`}
              >
                {day}
              </button>
            );
          })}
        </div>
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-sm">Upcoming Sessions</h4>
          {schedules.slice(0, 3).map((schedule) => (
            <div key={schedule.id} className="flex items-center text-sm p-2 bg-slate-50 rounded">
              <Clock className="w-4 h-4 mr-2 text-slate-500" />
              <span>{schedule.title}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}