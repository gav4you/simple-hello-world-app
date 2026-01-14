import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSession } from '@/components/hooks/useSession';
import { scopedFilter, scopedUpdate } from '@/components/api/scoped';
import { getQuizMeta, loadQuizForAccess, saveQuiz } from '@/components/academic/quizEngine';
import { toast } from 'sonner';
import { Plus, Pencil, Eye, Copy, ToggleLeft, ToggleRight } from 'lucide-react';

export default function TeachQuizzes() {
  const { activeSchoolId, isTeacher, isLoading, user } = useSession();
  const qc = useQueryClient();
  const [q, setQ] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const courseIdParam = urlParams.get('courseId');

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', activeSchoolId],
    queryFn: () => scopedFilter('Course', activeSchoolId, {}, 'title', 250),
    enabled: !!activeSchoolId,
  });

  const courseTitleById = useMemo(() => {
    const m = new Map();
    (courses || []).forEach((c) => m.set(String(c.id), c.title || c.name || 'Course'));
    return m;
  }, [courses]);

  const { data: quizzes = [], isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ['quizzes', activeSchoolId],
    queryFn: () => scopedFilter('Quiz', activeSchoolId, {}, '-created_date', 250),
    enabled: !!activeSchoolId,
  });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const base = courseIdParam
      ? (quizzes || []).filter((z) => String(z.course_id || '') === String(courseIdParam))
      : (quizzes || []);

    if (!needle) return base;

    return base.filter((z) => {
      const title = String(z.title || '').toLowerCase();
      const course = String(courseTitleById.get(String(z.course_id)) || '').toLowerCase();
      return title.includes(needle) || course.includes(needle);
    });
  }, [q, quizzes, courseTitleById, courseIdParam]);

  const togglePublish = useMutation({
    mutationFn: async (quiz) => {
      await scopedUpdate('Quiz', quiz.id, { is_published: !quiz.is_published }, activeSchoolId, true);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quizzes', activeSchoolId] });
    },
    onError: (e) => toast.error(String(e?.message || e)),
  });

  const duplicate = useMutation({
    mutationFn: async (quiz) => {
      if (!activeSchoolId) throw new Error('No active school');

      // Pull full quiz + questions as teacher and re-save as a draft.
      const res = await loadQuizForAccess({ schoolId: activeSchoolId, quizId: quiz.id, access: 'FULL', isTeacher: true });
      const meta = res.quiz || (await getQuizMeta({ schoolId: activeSchoolId, quizId: quiz.id }));
      const questions = res.questions || [];

      const newId = await saveQuiz({
        schoolId: activeSchoolId,
        meta: {
          ...meta,
          title: `Copy of ${meta?.title || 'Quiz'}`,
          is_published: false,
        },
        questions,
        userEmail: user?.email || null,
      });

      return newId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quizzes', activeSchoolId] });
      toast.success('Quiz duplicated');
    },
    onError: (e) => toast.error(String(e?.message || e)),
  });

  if (isLoading) {
    return <PageShell title="Quizzes" subtitle="Loading session…" />;
  }

  if (!activeSchoolId) {
    return (
      <PageShell title="Quizzes" subtitle="Select a school to manage quizzes.">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">No active school selected.</CardContent>
        </Card>
      </PageShell>
    );
  }

  if (!isTeacher) {
    return (
      <PageShell title="Quizzes" subtitle="Teacher access required">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            You don't have permission to manage quizzes in this school.
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Quizzes"
      subtitle="Create, publish and manage quizzes for your courses."
      actions={
        <Button asChild>
          <Link to={courseIdParam ? `/teach/quizzes/new?courseId=${encodeURIComponent(courseIdParam)}` : '/teach/quizzes/new'}>
            <Plus className="w-4 h-4 mr-2" />
            New quiz
          </Link>
        </Button>
      }
    >
      <div className="mb-4">
        <Input placeholder="Search by title or course…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-3 border-b px-4 py-3 text-xs font-semibold text-muted-foreground">
            <div className="col-span-5">Quiz</div>
            <div className="col-span-4">Course</div>
            <div className="col-span-1 text-center">Q</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {(isLoadingQuizzes ? [] : filtered).map((quiz) => {
            const courseTitle = courseTitleById.get(String(quiz.course_id)) || '—';
            const qCount = Array.isArray(quiz.questions)
              ? quiz.questions.length
              : Number(quiz.questions_count || 0);
            const published = !!quiz.is_published;

            return (
              <div key={quiz.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3 hover:bg-muted/40">
                <div className="col-span-5">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{quiz.title || 'Untitled quiz'}</div>
                    {published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}
                  </div>
                  {quiz.description ? (
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{quiz.description}</div>
                  ) : null}
                </div>

                <div className="col-span-4 text-sm text-muted-foreground">{courseTitle}</div>

                <div className="col-span-1 text-center text-sm">{qCount}</div>

                <div className="col-span-2 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish.mutate(quiz)}
                    disabled={togglePublish.isPending}
                    title={published ? 'Unpublish' : 'Publish'}
                  >
                    {published ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" asChild title="Edit">
                    <Link to={`/teach/quizzes/${quiz.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild title="Preview">
                    <Link to={`/quiz/${quiz.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicate.mutate(quiz)}
                    disabled={duplicate.isPending}
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {!isLoadingQuizzes && filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No quizzes yet.</div>
          ) : null}

          {isLoadingQuizzes ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading quizzes…</div>
          ) : null}
        </CardContent>
      </Card>
    </PageShell>
  );
}
