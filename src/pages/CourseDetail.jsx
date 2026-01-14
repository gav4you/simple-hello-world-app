import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Crown, Play, Lock, CheckCircle, BookOpen, ClipboardCheck } from 'lucide-react';

import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { scopedFilter } from '@/components/api/scoped';
import { getRawEntity } from '@/components/api/tenancyEnforcer';
import { useSession } from '@/components/hooks/useSession';
import { isEntitlementActive } from '@/components/utils/entitlements';
import { toast } from '@/components/ui/use-toast';

function uniqStrings(list) {
  const out = [];
  const seen = new Set();
  for (const v of list || []) {
    const s = String(v || '');
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function getCourseIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

function accessForQuiz({ quiz, isTeacher, hasCourseAccess }) {
  if (isTeacher) return 'FULL';
  if (hasCourseAccess) return 'FULL';
  const previewLimit = Number(quiz?.preview_limit_questions || 0);
  return previewLimit > 0 ? 'PREVIEW' : 'LOCKED';
}

export default function CourseDetail() {
  const courseId = getCourseIdFromUrl();
  const { user, memberships, activeSchoolId, changeActiveSchool, role, isTeacher, isLoading } = useSession();

  const canTeach = !!isTeacher;

  // Resolve course across schools the user belongs to (handles deep links even when active school differs).
  const { data: resolvedCourse, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course-resolve', courseId, user?.email, activeSchoolId, (memberships || []).length],
    queryFn: async () => {
      if (!courseId || !user?.email) return null;

      const candidateSchoolIds = uniqStrings([
        activeSchoolId,
        ...(memberships || []).map((m) => m.school_id),
      ]);

      const rawCourse = getRawEntity(base44, 'Course');
      if (!rawCourse?.filter) return null;

      for (const sid of candidateSchoolIds) {
        try {
          const rows = await rawCourse.filter({ id: courseId, school_id: sid }, '-created_date', 1);
          if (rows?.[0]) {
            return { course: rows[0], schoolId: sid };
          }
        } catch {
          // continue
        }
      }

      return null;
    },
    enabled: !!courseId && !!user?.email && !isLoading,
  });

  const course = resolvedCourse?.course || null;
  const courseSchoolId = resolvedCourse?.schoolId || course?.school_id || null;

  // If this course belongs to a different school, switch the active school so the rest
  // of the app (tenancy enforcer, scoped queries) behaves consistently.
  useEffect(() => {
    if (!courseSchoolId) return;
    if (!activeSchoolId) return;
    if (String(courseSchoolId) === String(activeSchoolId)) return;

    // Only switch if the user is actually a member of the course's school.
    const ok = (memberships || []).some((m) => String(m.school_id) === String(courseSchoolId));
    if (!ok) return;

    changeActiveSchool(courseSchoolId)
      .then(() => {
        toast({
          title: 'Switched active school',
          description: 'We switched your active school to match this course.',
        });
      })
      .catch(() => {
        // ignore
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSchoolId]);

  const effectiveRole = useMemo(() => {
    if (!courseSchoolId) return role;
    const m = (memberships || []).find((x) => String(x.school_id) === String(courseSchoolId));
    return m?.role || role;
  }, [memberships, courseSchoolId, role]);

  // Legacy subscription tier (kept for backward compatibility)
  const { data: subscription } = useQuery({
    queryKey: ['subscription-legacy', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      try {
        const subs = await base44.entities.Subscription.filter({ user_email: user.email }, '-created_date', 1);
        return subs?.[0] || null;
      } catch {
        return null;
      }
    },
    enabled: !!user?.email,
  });

  const userTier = String(subscription?.tier || 'free').toLowerCase();

  // Entitlements for the course school (modern access path)
  const { data: entitlements = [] } = useQuery({
    queryKey: ['entitlements', courseSchoolId, user?.email],
    queryFn: () => scopedFilter('Entitlement', courseSchoolId, { user_email: user.email }, '-created_date', 500),
    enabled: !!courseSchoolId && !!user?.email && !isTeacher,
  });

  const activeEntitlements = useMemo(() => (entitlements || []).filter((e) => isEntitlementActive(e)), [entitlements]);

  const hasEntitledCourseAccess = useMemo(() => {
    if (!course) return false;
    if (['OWNER', 'ADMIN', 'INSTRUCTOR', 'TA'].includes(String(effectiveRole || '').toUpperCase())) return true;

    // Modern access_level model
    if (String(course.access_level || '').toUpperCase() === 'FREE') return true;
    if (['PAID', 'PRIVATE'].includes(String(course.access_level || '').toUpperCase())) {
      const cid = String(course.id);
      const has = (activeEntitlements || []).some((e) => {
        const t = e.type || e.entitlement_type;
        if (t === 'ALL_COURSES') return true;
        if (t === 'COURSE' && String(e.course_id) === cid) return true;
        return false;
      });
      return has;
    }

    return false;
  }, [course, effectiveRole, activeEntitlements]);

  const hasTierAccess = useMemo(() => {
    if (!course) return false;
    const tier = String(course.access_tier || 'free').toLowerCase();
    if (tier === 'free') return true;
    if (tier === 'premium') return ['premium', 'elite'].includes(userTier);
    if (tier === 'elite') return userTier === 'elite';
    return false;
  }, [course, userTier]);

  const hasCourseAccess = !!(hasEntitledCourseAccess || hasTierAccess);

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseSchoolId, courseId],
    queryFn: () => scopedFilter('Lesson', courseSchoolId, { course_id: courseId }, 'order', 1000),
    enabled: !!courseSchoolId && !!courseId,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', courseSchoolId, user?.email, courseId],
    queryFn: () => scopedFilter('UserProgress', courseSchoolId, { user_email: user.email, course_id: courseId }, '-created_date', 1000),
    enabled: !!courseSchoolId && !!user?.email && !!courseId,
  });

  const completedLessons = progress.filter((p) => p.completed).length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
  const courseCompleted = progressPercentage === 100 && lessons.length > 0;

  const { data: certificate } = useQuery({
    queryKey: ['certificate', courseSchoolId, user?.email, courseId],
    queryFn: async () => {
      const certs = await scopedFilter('Certificate', courseSchoolId, { user_email: user.email, course_id: courseId }, '-created_date', 1);
      return certs?.[0] || null;
    },
    enabled: !!courseSchoolId && !!user?.email && !!courseId && courseCompleted,
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes-for-course', courseSchoolId, courseId, canTeach],
    queryFn: () => {
      const base = { course_id: courseId };
      const filters = canTeach ? base : { ...base, is_published: true };
      return scopedFilter('Quiz', courseSchoolId, filters, '-created_date', 250);
    },
    enabled: !!courseSchoolId && !!courseId,
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['quiz-attempts', courseSchoolId, user?.email],
    queryFn: () => scopedFilter('QuizAttempt', courseSchoolId, { user_email: user.email }, '-created_date', 250),
    enabled: !!courseSchoolId && !!user?.email && !isTeacher,
  });

  const lastAttemptByQuizId = useMemo(() => {
    const m = new Map();
    (quizAttempts || []).forEach((a) => {
      const qid = String(a.quiz_id || '');
      if (!qid) return;
      if (!m.has(qid)) m.set(qid, a);
    });
    return m;
  }, [quizAttempts]);

  const getLessonStatus = (lesson) => {
    const lessonProgress = progress.find((p) => p.lesson_id === lesson.id);
    return lessonProgress?.completed ? 'completed' : lessonProgress ? 'in-progress' : 'not-started';
  };

  if (isLoading || isLoadingCourse) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-600">Loading course…</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">Course not found or you don’t have access.</p>
        <div className="mt-4">
          <Link to={createPageUrl('Courses')}>
            <Button variant="outline">Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to={createPageUrl('Courses')}>
        <Button variant="ghost" className="group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Courses
        </Button>
      </Link>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className="bg-amber-500 text-white">{course.category?.replace(/_/g, ' ')}</Badge>
              <Badge className="bg-slate-700 text-white">{course.level}</Badge>
              {course.access_tier ? (
                <Badge className="bg-slate-700 text-white flex items-center space-x-1">
                  <Crown className="w-3 h-3" />
                  <span>{course.access_tier}</span>
                </Badge>
              ) : null}
              {course.access_level ? (
                <Badge className="bg-slate-700 text-white">{String(course.access_level).toLowerCase()}</Badge>
              ) : null}
            </div>

            {canTeach && courseId ? (
              <div className="mb-4 flex flex-wrap gap-2">
                <Link to={`/teach/quizzes?courseId=${courseId}`}>
                  <Button size="sm" variant="secondary">Manage Quizzes</Button>
                </Link>
                <Link to={`/teach/quizzes/new?courseId=${courseId}`}>
                  <Button size="sm" variant="outline">New Quiz</Button>
                </Link>
              </div>
            ) : null}

            <h1 className="text-4xl font-bold text-white mb-3">{course.title}</h1>
            {course.title_hebrew ? (
              <h2 className="text-2xl text-amber-400 mb-4" dir="rtl">
                {course.title_hebrew}
              </h2>
            ) : null}

            <p className="text-slate-300 text-lg mb-6">{course.description}</p>

            <div className="flex items-center space-x-6 text-slate-300">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>By {course.instructor}</span>
              </div>
              {course.duration_hours ? (
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration_hours} hours</span>
                </div>
              ) : null}
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>{lessons.length} lessons</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClipboardCheck className="w-5 h-5" />
                <span>{quizzes.length} quizzes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            {hasCourseAccess ? (
              <Card className="w-full bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-bold text-green-900 mb-2">You have access!</h3>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-green-900">{progressPercentage}%</div>
                    <div className="text-sm text-green-700">Complete</div>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2 mb-4">
                    <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
                  </div>

                  {courseCompleted && certificate ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-green-600 text-green-900 hover:bg-green-100"
                      onClick={async () => {
                        const { issueCertificateIfEligible } = await import('../components/certificates/certificatesEngine');
                        try {
                          const cert = await issueCertificateIfEligible({
                            school_id: course.school_id,
                            user_email: user.email,
                            user_name: user.full_name,
                            course_id: course.id,
                          });
                          window.open(createPageUrl(`CertificateVerify?certificateId=${cert.certificate_id}`), '_blank');
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    >
                      View Certificate
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full bg-amber-50 border-amber-200">
                <CardContent className="p-6 text-center">
                  <Crown className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-bold text-amber-900 mb-2">Course Access Required</h3>
                  <p className="text-amber-800 text-sm mb-4">Upgrade or purchase access to unlock this course.</p>
                  <Link to={createPageUrl('Subscription')}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                      Upgrade Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Quizzes */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Assessments</h2>
        <div className="space-y-3">
          {quizzes.map((quiz) => {
            const access = accessForQuiz({ quiz, isTeacher: canTeach, hasCourseAccess });
            const last = lastAttemptByQuizId.get(String(quiz.id));
            const score = last ? Number(last.score || 0) : null;

            return (
              <Card key={quiz.id} className={`transition-all ${access === 'LOCKED' ? 'opacity-70' : 'hover:shadow-lg'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-900 truncate">{quiz.title || 'Quiz'}</div>
                        {access === 'FULL' ? (
                          <Badge>Unlocked</Badge>
                        ) : access === 'PREVIEW' ? (
                          <Badge variant="secondary">Preview</Badge>
                        ) : (
                          <Badge variant="outline">Locked</Badge>
                        )}
                        {!canTeach && score !== null ? <Badge variant="outline">Last score: {score}%</Badge> : null}
                        {canTeach ? (
                          quiz.is_published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>
                        ) : null}
                      </div>
                      {quiz.description ? <p className="text-slate-500 text-sm mt-1 line-clamp-2">{quiz.description}</p> : null}
                    </div>

                    <div className="flex items-center gap-2">
                      {access === 'LOCKED' ? (
                        <Button variant="outline" disabled>
                          <Lock className="w-4 h-4 mr-2" />
                          Locked
                        </Button>
                      ) : (
                        <Link to={`/quiz/${quiz.id}`}>
                          <Button>
                            <Play className="w-4 h-4 mr-2" />
                            {access === 'PREVIEW' ? 'Start Preview' : 'Start'}
                          </Button>
                        </Link>
                      )}
                      {canTeach ? (
                        <Link to={`/teach/quizzes/${quiz.id}`}>
                          <Button variant="outline">Edit</Button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {quizzes.length === 0 ? (
            <Card className="bg-slate-50">
              <CardContent className="p-12 text-center">
                <ClipboardCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No quizzes available yet</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Lessons List */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Curriculum</h2>
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const status = getLessonStatus(lesson);
            const canAccess = hasCourseAccess || lesson.is_preview;

            return (
              <Card
                key={lesson.id}
                className={`transition-all ${canAccess ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'}`}
              >
                <CardContent className="p-6">
                  <Link
                    to={canAccess ? createPageUrl(`LessonViewer?id=${lesson.id}`) : '#'}
                    className="block"
                    onClick={(e) => !canAccess && e.preventDefault()}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            status === 'completed'
                              ? 'bg-green-100'
                              : status === 'in-progress'
                              ? 'bg-blue-100'
                              : 'bg-slate-100'
                          }`}
                        >
                          {status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : canAccess ? (
                            <Play className="w-5 h-5 text-slate-600" />
                          ) : (
                            <Lock className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-semibold text-slate-900">
                              {index + 1}. {lesson.title}
                            </h3>
                            {lesson.is_preview ? (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">Free Preview</Badge>
                            ) : null}
                          </div>
                          {lesson.title_hebrew ? (
                            <p className="text-amber-700 text-sm" dir="rtl">
                              {lesson.title_hebrew}
                            </p>
                          ) : null}
                          {lesson.duration_minutes ? (
                            <p className="text-slate-500 text-sm mt-1">{lesson.duration_minutes} minutes</p>
                          ) : null}
                        </div>
                      </div>

                      {canAccess ? (
                        <Button variant="ghost" size="sm">
                          {status === 'completed' ? 'Review' : 'Start'}
                        </Button>
                      ) : null}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}

          {lessons.length === 0 ? (
            <Card className="bg-slate-50">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No lessons available yet</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
