import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { scopedFilter } from '@/components/api/scoped';
import { useSession } from '@/components/hooks/useSession';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import PremiumVideoPlayer from '../components/learning/PremiumVideoPlayer';
import BookmarkPanel from '../components/learning/BookmarkPanel';
import TranscriptPanel from '../components/learning/TranscriptPanel';
import NotesPanel from '../components/learning/NotesPanel';
import AiTutorPanel from '../components/ai/AiTutorPanel';
import { shouldFetchMaterials } from '@/components/materials/materialsEngine';
import { useLessonAccess } from '../components/hooks/useLessonAccess';
import ProtectedContent from '../components/protection/ProtectedContent';
import AccessGate from '../components/security/AccessGate';

export default function LessonViewerPremium() {
  const { user, activeSchool, activeSchoolId, isLoading } = useSession();
  const [currentTime, setCurrentTime] = useState(0);
  const queryClient = useQueryClient();
  const videoPlayerRef = useRef(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');

  useEffect(() => {
    if (!isLoading && !user) {
      try { base44.auth.redirectToLogin(); } catch {}
    }
  }, [isLoading, user]);

const { data: lesson } = useQuery({
    queryKey: ['lesson', activeSchoolId, lessonId],
    queryFn: async () => {
      const lessons = await scopedFilter('Lesson', activeSchoolId, { id: lessonId });
      return lessons[0];
    },
    enabled: !!activeSchoolId && !!lessonId
  });

  // Access control
  const access = useLessonAccess(
    lesson?.course_id,
    lessonId,
    user,
    lesson?.school_id
  );

  const canFetchMaterials = shouldFetchMaterials(access.accessLevel);
  const rawContent = lesson?.content || '';
  const contentToShow = (access.accessLevel === 'FULL')
    ? rawContent
    : (access.accessLevel === 'PREVIEW')
      ? (rawContent.slice(0, access.maxPreviewChars || 1500) + (rawContent.length > (access.maxPreviewChars || 1500) ? '…' : ''))
      : '';

  const { data: course } = useQuery({
    queryKey: ['course', activeSchoolId, lesson?.course_id],
    queryFn: async () => {
      const courses = await scopedFilter('Course', activeSchoolId, { id: lesson.course_id });
      return courses[0];
    },
    enabled: !!activeSchoolId && !!lesson?.course_id
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['lessons', activeSchoolId, lesson?.course_id],
    queryFn: () => scopedFilter('Lesson', activeSchoolId, { course_id: lesson.course_id }, 'order'),
    enabled: !!activeSchoolId && !!lesson?.course_id
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', activeSchoolId, user?.email, lessonId],
    queryFn: async () => {
      const progs = await scopedFilter('UserProgress', activeSchoolId, {
        user_email: user.email,
        lesson_id: lessonId,
      });
      return progs[0] || null;
    },
    enabled: !!activeSchoolId && !!user?.email && !!lessonId
  });

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
          <Button variant="ghost" className="group mb-4">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to {course.title}
          </Button>
        </Link>

        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-8 shadow-2xl">
          <p className="text-amber-400 text-sm mb-2 font-medium">{course.title}</p>
          <h1 className="text-4xl font-bold text-white mb-2">{lesson.title}</h1>
          {lesson.title_hebrew && (
            <h2 className="text-2xl text-amber-300 font-serif" dir="rtl">{lesson.title_hebrew}</h2>
          )}
          <div className="flex items-center space-x-2 mt-4">
            {progress?.completed && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
            {access.accessLevel === 'PREVIEW' && (
              <Badge className="bg-amber-500">Preview Mode</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Premium Video Player */}
      {canFetchMaterials && (lesson.video_url || lesson.audio_url) && (
        <div ref={videoPlayerRef}>
          <PremiumVideoPlayer
            lesson={lesson}
            progress={progress}
            user={user}
            accessLevel={access.accessLevel}
            maxPreviewSeconds={access.maxPreviewSeconds}
            onProgressUpdate={() => queryClient.invalidateQueries(['progress'])}
          />
        </div>
      )}

      {/* Lesson Content & Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <ProtectedContent
                policy={access.policy}
                userEmail={user?.email}
                schoolName={activeSchool?.name}
                canCopy={access.canCopy}
                canDownload={access.canDownload}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Lesson Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReactMarkdown className="prose prose-slate max-w-none prose-headings:font-serif">
                      {canFetchMaterials ? (contentToShow || 'No content available') : 'This lesson is locked. Purchase or enroll to access the content.'}
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
                  </CardContent>
                </Card>
              </ProtectedContent>
            </TabsContent>

            <TabsContent value="transcript">
              <TranscriptPanel lesson={lesson} accessLevel={access.accessLevel} maxPreviewChars={access.maxPreviewChars} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Tools */}
        <div className="space-y-6">
          <AiTutorPanel
            contextType="LESSON"
            contextId={lesson.id}
            contextTitle={lesson.title}
            contextContent={canFetchMaterials ? contentToShow : ''}
            user={user}
            schoolId={lesson.school_id}
          />

          <BookmarkPanel
            lesson={lesson}
            user={user}
            currentTime={currentTime}
            onSeek={(time) => {
              if (videoPlayerRef.current?.seekTo) {
                videoPlayerRef.current.seekTo(time);
              }
            }}
          />

          <NotesPanel lesson={lesson} user={user} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        {previousLesson ? (
          <Link to={createPageUrl(`LessonViewerPremium?id=${previousLesson.id}`)}>
            <Button variant="outline" className="group">
              <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Previous Lesson
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link to={createPageUrl(`LessonViewerPremium?id=${nextLesson.id}`)}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 group">
              Next Lesson
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        ) : (
          <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
            <Button className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}