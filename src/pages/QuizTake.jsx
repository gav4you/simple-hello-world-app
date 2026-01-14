import React, { useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from '@/components/hooks/useSession';
import { scopedFilter } from '@/components/api/scoped';
import { isEntitlementActive } from '@/components/utils/entitlements';
import { getQuizMeta, loadQuizForAccess } from '@/components/academic/quizEngine';
import QuizCard from '@/components/learning/QuizCard';

export default function QuizTake() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const quizId = (params.quizId || searchParams.get('quizId') || searchParams.get('id') || '').trim();
const { user, activeSchoolId, memberships, changeActiveSchool, isTeacher, isLoading } = useSession();

  const membershipSchoolIds = useMemo(() => {
    const ids = new Set();
    (memberships || []).forEach((m) => {
      if (m?.school_id) ids.add(String(m.school_id));
    });
    return Array.from(ids);
  }, [memberships]);

  // Resolve which school owns this quiz.
  const { data: resolved, isLoading: isResolving } = useQuery({
    queryKey: ['quiz-resolve', quizId, activeSchoolId, membershipSchoolIds.join(',')],
    queryFn: async () => {
      if (!quizId) return { quiz: null, schoolId: null };

      const trySchool = async (sid) => {
        if (!sid) return null;
        return await getQuizMeta({ schoolId: sid, quizId });
      };

      let quiz = await trySchool(activeSchoolId);
      if (quiz) return { quiz, schoolId: String(quiz.school_id || activeSchoolId) };

      for (const sid of membershipSchoolIds) {
        quiz = await trySchool(sid);
        if (quiz) return { quiz, schoolId: String(quiz.school_id || sid) };
      }

      return { quiz: null, schoolId: null };
    },
    enabled: !!quizId && !isLoading,
  });

  const quiz = resolved?.quiz || null;
  const resolvedSchoolId = resolved?.schoolId || null;

  // Ensure tenant context matches quiz school.
  useEffect(() => {
    if (!resolvedSchoolId) return;
    if (activeSchoolId && String(activeSchoolId) === String(resolvedSchoolId)) return;
    changeActiveSchool(resolvedSchoolId);
  }, [resolvedSchoolId]);

  const { data: entitlements = [] } = useQuery({
    queryKey: ['entitlements', resolvedSchoolId, user?.email],
    queryFn: () => scopedFilter('Entitlement', resolvedSchoolId, { user_email: user.email }, '-created_date', 250),
    enabled: !!resolvedSchoolId && !!user?.email && !isTeacher,
  });

  const activeEnts = useMemo(() => (entitlements || []).filter((e) => isEntitlementActive(e)), [entitlements]);

  const access = useMemo(() => {
    if (isTeacher) return 'FULL';
    if (!quiz) return 'LOCKED';

    // Quizzes with no course binding are available to any signed-in user in the school.
    if (!quiz.course_id) return 'FULL';

    const cid = String(quiz.course_id);
    const hasCourse = activeEnts.some((e) => {
      const type = e.type || e.entitlement_type;
      if (type === 'ALL_COURSES') return true;
      if (type === 'COURSE' && String(e.course_id) === cid) return true;
      return false;
    });

    if (hasCourse) return 'FULL';

    const previewLimit = Number(quiz.preview_limit_questions || 0);
    return previewLimit > 0 ? 'PREVIEW' : 'LOCKED';
  }, [isTeacher, quiz, activeEnts]);

  const { data: loaded, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz-load', resolvedSchoolId, quizId, access],
    queryFn: () => loadQuizForAccess({ schoolId: resolvedSchoolId, quizId, access, isTeacher }),
    enabled: !!resolvedSchoolId && !!quizId,
  });

  if (isLoading || isResolving || isLoadingQuiz) {
    return <PageShell title="Quiz" subtitle="Loading…" />;
  }

  if (!quiz) {
    return (
      <PageShell title="Quiz" subtitle="Not found">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            This quiz doesn't exist or you don't have access.
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  if (!quiz.is_published && !isTeacher) {
    return (
      <PageShell title="Quiz" subtitle="Unavailable">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">This quiz isn't published yet.</CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={quiz.title || 'Quiz'}
      subtitle={quiz.description || (access === 'PREVIEW' ? 'Preview mode.' : 'Answer the questions and submit to see your score.')}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link to="/courses">Back to courses</Link>
          </Button>
          {access === 'PREVIEW' ? (
            <Button variant="secondary" asChild>
              <Link to="/pricing">Unlock full access</Link>
            </Button>
          ) : null}
        </>
      }
    >
      <QuizCard
        quiz={quiz}
        questions={loaded?.questions || []}
        user={user}
        schoolId={resolvedSchoolId}
        access={access}
      />
    </PageShell>
  );
}
