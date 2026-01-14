import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/components/hooks/useSession';
import { scopedFilter } from '@/components/api/scoped';
import { isEntitlementActive } from '@/components/utils/entitlements';

function canAccessQuiz(quiz, isTeacher, activeEntitlements) {
  if (isTeacher) return 'FULL';
  if (!quiz?.course_id) return 'FULL';
  const cid = String(quiz.course_id);
  const has = (activeEntitlements || []).some((e) => {
    const type = e.type || e.entitlement_type;
    if (type === 'ALL_COURSES') return true;
    if (type === 'COURSE' && String(e.course_id) === cid) return true;
    return false;
  });
  if (has) return 'FULL';
  const previewLimit = Number(quiz.preview_limit_questions || 0);
  return previewLimit > 0 ? 'PREVIEW' : 'LOCKED';
}

export default function MyQuizzes() {
  const { activeSchoolId, user, isTeacher, isLoading } = useSession();

  const { data: entitlements = [] } = useQuery({
    queryKey: ['entitlements', activeSchoolId, user?.email],
    queryFn: () => scopedFilter('Entitlement', activeSchoolId, { user_email: user.email }, '-created_date', 250),
    enabled: !!activeSchoolId && !!user?.email && !isTeacher,
  });

  const activeEnts = useMemo(() => (entitlements || []).filter((e) => isEntitlementActive(e)), [entitlements]);

  const { data: quizzes = [], isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ['quizzes-published', activeSchoolId],
    queryFn: () => scopedFilter('Quiz', activeSchoolId, { is_published: true }, '-created_date', 250),
    enabled: !!activeSchoolId,
  });

  const visible = useMemo(() => {
    return (quizzes || []).map((q) => ({
      quiz: q,
      access: canAccessQuiz(q, isTeacher, activeEnts),
    }));
  }, [quizzes, isTeacher, activeEnts]);

  if (isLoading) return <PageShell title="My Quizzes" subtitle="Loading session…" />;

  if (!activeSchoolId) {
    return (
      <PageShell title="My Quizzes" subtitle="Select a school to view quizzes.">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">No active school selected.</CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="My Quizzes" subtitle="Take quizzes and track your progress.">
      <Card>
        <CardContent className="p-0">
          {isLoadingQuizzes ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading quizzes…</div>
          ) : null}

          {!isLoadingQuizzes && visible.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No quizzes available yet.</div>
          ) : null}

          {visible.map(({ quiz, access }) => (
            <div key={quiz.id} className="flex items-center justify-between gap-4 px-4 py-3 border-b last:border-b-0">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">{quiz.title || 'Quiz'}</div>
                  {access === 'FULL' ? <Badge>Unlocked</Badge> : access === 'PREVIEW' ? <Badge variant="secondary">Preview</Badge> : <Badge variant="outline">Locked</Badge>}
                </div>
                {quiz.description ? <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{quiz.description}</div> : null}
              </div>

              <div className="flex items-center gap-2">
                <Button asChild disabled={access === 'LOCKED'}>
                  <Link to={`/quiz/${quiz.id}`}>{access === 'PREVIEW' ? 'Start Preview' : 'Start'}</Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}
