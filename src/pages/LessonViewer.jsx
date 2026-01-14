import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import DiscussionThread from '../components/learning/DiscussionThread';
import AITutor from '../components/ai/AITutor';
import TranscriptViewer from '../components/video/TranscriptViewer';
import Whiteboard from '../components/collaboration/Whiteboard';
import OfflineMode from '../components/mobile/OfflineMode';
import AdvancedVideoPlayer from '../components/video/AdvancedVideoPlayer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import { shouldFetchMaterials } from '@/components/materials/materialsEngine';
import { toast } from 'sonner';
import { useLessonAccess } from '../components/hooks/useLessonAccess';
import { scopedFilter, scopedCreate, scopedUpdate } from '@/components/api/scoped';
import ProtectedContent from '../components/protection/ProtectedContent';
import AccessGate from '../components/security/AccessGate';
import { scopedFilter } from '../components/api/scoped';

export default function LessonViewer() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [activeSchool, setActiveSchool] = useState(null);
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
        
        if (schoolId) {
          const schools = await base44.entities.School.filter({ id: schoolId });
          if (schools[0]) setActiveSchool(schools[0]);
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId, activeSchoolId],
    queryFn: async () => {
      const lessons = await scopedFilter('Lesson', activeSchoolId, { id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId && !!activeSchoolId
  });

  const { data: course } = useQuery({
    queryKey: ['course', lesson?.course_id, activeSchoolId],
    queryFn: async () => {
      const courses = await scopedFilter('Course', activeSchoolId, { id: lesson.course_id });
      return courses[0];
    },
    enabled: !!lesson?.course_id && !!activeSchoolId
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['lessons', lesson?.course_id, activeSchoolId],
    queryFn: () => scopedFilter('Lesson', activeSchoolId, { course_id: lesson.course_id }, 'order'),
    enabled: !!lesson?.course_id && !!activeSchoolId
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', user?.email, lessonId, activeSchoolId],
    queryFn: async () => {
      const progs = await scopedFilter('UserProgress', activeSchoolId, { 
        user_email: user.email,
        lesson_id: lessonId 
      });
      return progs[0];
    },
    enabled: !!user?.email && !!lessonId && !!activeSchoolId
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions', lesson?.course_id, lessonId, activeSchoolId],
    queryFn: () => scopedFilter('Discussion', activeSchoolId, { 
      course_id: lesson.course_id,
      lesson_id: lessonId 
    }, '-created_date'),
    enabled: !!lesson?.course_id && !!activeSchoolId
  });

  // Access control
  const access = useLessonAccess(lesson?.course_id, lessonId, user, activeSchoolId);

  
const canFetchMaterials = shouldFetchMaterials(access.accessLevel);
const rawContent = String(lesson?.content || lesson?.text || '');
const contentToShow = (access.accessLevel === 'FULL')
  ? rawContent
  : (access.accessLevel === 'PREVIEW')
    ? rawContent.slice(0, access.maxPreviewChars || 1500)
    : '';

if (access.accessLevel === 'LOCKED' || access.accessLevel === 'DRIP_LOCKED') {
  return (
    <AccessGate
      mode={access.accessLevel}
      courseId={lesson?.course_id}
      schoolSlug={activeSchool?.slug}
      message={access.accessLevel === 'DRIP_LOCKED' ? (access.dripInfo?.countdownLabel || 'This lesson will unlock soon.') : undefined}
    />
  );
}

useEffect(() => {
    if (progress?.notes) {
      setNotes(progress.notes);
    }
  }, [progress]);

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (progress) {
        return await scopedUpdate('UserProgress', progress.id, {
          completed: true,
          progress_percentage: 100
        }, activeSchoolId, true);
      } else {
        return await scopedCreate('UserProgress', activeSchoolId, {
          user_email: user.email,
          lesson_id: lessonId,
          course_id: lesson.course_id,
          completed: true,
          progress_percentage: 100
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['progress']);
      toast.success('Lesson marked as complete!');
    }
  });

  const saveNotesMutation = useMutation({
    mutationFn: async (noteContent) => {
      if (progress) {
        return await scopedUpdate('UserProgress', progress.id, { notes: noteContent }, activeSchoolId, true);
      } else {
        return await scopedCreate('UserProgress', activeSchoolId, {
          user_email: user.email,
          lesson_id: lessonId,
          course_id: lesson.course_id,
          notes: noteContent,
          completed: false,
          progress_percentage: 0
        }, activeSchoolId, true);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['progress']);
      toast.success('Notes saved!');
    }
  });

  if (!lesson || !course) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-600">Loading lesson...</p>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
          <Button variant="ghost" className="group mb-4">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to {course.title}
          </Button>
        </Link>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 shadow-lg">
          <p className="text-amber-400 text-sm mb-2">{course.title}</p>
          <h1 className="text-3xl font-bold text-white mb-2">{lesson.title}</h1>
          {lesson.title_hebrew && (
            <h2 className="text-xl text-amber-300" dir="rtl">{lesson.title_hebrew}</h2>
          )}
          {access.accessLevel === 'PREVIEW' && (
            <Badge className="mt-2 bg-amber-500">Preview Mode</Badge>
          )}
        </div>
      </div>

      {/* Video/Audio Player */}
      {lesson.video_url && access.accessLevel !== 'LOCKED' && (
        <AdvancedVideoPlayer
          src={lesson.video_url}
          onTimeUpdate={(time) => {
            // Auto-save progress
            if (progress) {
              scopedUpdate('UserProgress', progress.id, {
                last_position_seconds: Math.floor(time)
              }, activeSchoolId, true);
            }
          }}
          onEnded={() => {
            // Auto-complete lesson when video ends
            if (!progress?.completed) {
              markCompleteMutation.mutate();
            }
          }}
          initialTime={progress?.last_position_seconds || 0}
        />
      )}

      {lesson.audio_url && !lesson.video_url && (
        <div className="bg-slate-100 rounded-xl p-6">
          <audio controls className="w-full" src={lesson.audio_url}>
            Your browser does not support audio playback.
          </audio>
        </div>
      )}

      {/* Lesson Content */}
      {contentToShow && (
        <ProtectedContent
          policy={access.policy}
          userEmail={user?.email}
          schoolName={activeSchool?.name}
          canCopy={access.canCopy}
          canDownload={access.canDownload}
        >
          <div className="bg-white rounded-xl shadow-md p-8">
            <ReactMarkdown className="prose prose-slate max-w-none prose-headings:font-serif">
              {contentToShow}
            </ReactMarkdown>
            {access.accessLevel === 'PREVIEW' && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <p className="text-amber-800 mb-3">Preview limit reached</p>
                <Link to={createPageUrl(`CourseSales?slug=${activeSchool?.slug}&courseId=${course.id}`)}>
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    Purchase Full Access
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </ProtectedContent>
      )}

      {/* Discussion Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <DiscussionThread
          discussions={discussions || []}
          courseId={lesson.course_id}
          lessonId={lessonId}
          user={user}
        />
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-lg text-slate-900 mb-3">Personal Study Notes</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your thoughts, questions, and insights here..."
          className="min-h-32 mb-3"
        />
        <Button 
          onClick={() => saveNotesMutation.mutate(notes)}
          variant="outline"
          disabled={saveNotesMutation.isPending}
        >
          Save Notes
        </Button>
      </div>

      {/* Complete Button */}
      {!progress?.completed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <Button
            onClick={() => markCompleteMutation.mutate()}
            disabled={markCompleteMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Mark as Complete
          </Button>
        </div>
      )}

      {progress?.completed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-900 font-semibold">Lesson Completed!</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        {previousLesson ? (
          <Link to={createPageUrl(`LessonViewer?id=${previousLesson.id}`)}>
            <Button variant="outline" className="group">
              <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Previous Lesson
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link to={createPageUrl(`LessonViewer?id=${nextLesson.id}`)}>
            <Button className="bg-blue-600 hover:bg-blue-700 group">
              Next Lesson
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        ) : (
          <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
            <Button className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Course Complete
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}