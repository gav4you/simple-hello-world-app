import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/components/hooks/useSession';
import { scopedFilter } from '@/components/api/scoped';
import { loadQuizForAccess, saveQuiz } from '@/components/academic/quizEngine';
import { toast } from 'sonner';
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react';

function makeBlankQuestion() {
  return {
    prompt: '',
    prompt_hebrew: '',
    options: ['', ''],
    correctIndex: 0,
    explanation: '',
    points: 1,
  };
}

const questionSchema = z
  .object({
    prompt: z.string().min(5, 'Question text is required'),
    prompt_hebrew: z.string().optional().or(z.literal('')),
    options: z.array(z.string().min(1, 'Option is required')).min(2, 'At least two options'),
    correctIndex: z.coerce.number().int().min(0),
    explanation: z.string().optional().or(z.literal('')),
    points: z.coerce.number().int().min(1).max(100).default(1),
  })
  .superRefine((val, ctx) => {
    if (val.correctIndex >= val.options.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Correct answer must be one of the options',
        path: ['correctIndex'],
      });
    }
  });

const quizSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
  course_id: z.string().min(1, 'Course is required'),
  lesson_id: z.string().optional().or(z.literal('')),
  passing_score: z.coerce.number().min(0).max(100).default(70),
  preview_limit_questions: z.coerce.number().int().min(0).max(10).default(2),
  shuffle_questions: z.boolean().default(false),
  time_limit_seconds: z.coerce.number().int().min(0).max(60 * 60 * 6).optional().or(z.literal('')),
  max_attempts: z.coerce.number().int().min(0).max(50).optional().or(z.literal('')),
  is_published: z.boolean().default(false),
  questions: z.array(questionSchema).min(1, 'Add at least one question'),
});

function OptionsEditor({ control, register, qIndex, correctIndexValue, setCorrectIndex }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${qIndex}.options`,
  });

  return (
    <div className="space-y-2">
      {fields.map((opt, i) => (
        <div key={opt.id} className="flex items-center gap-2">
          <RadioGroup
            value={String(correctIndexValue)}
            onValueChange={(v) => setCorrectIndex(Number(v))}
            className="flex items-center"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value={String(i)} id={`q${qIndex}-opt-${i}`} />
            </div>
          </RadioGroup>
          <Input placeholder={`Option ${i + 1}`} {...register(`questions.${qIndex}.options.${i}`)} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              remove(i);
              if (correctIndexValue === i) setCorrectIndex(0);
              if (correctIndexValue > i) setCorrectIndex(correctIndexValue - 1);
            }}
            disabled={fields.length <= 2}
            title="Remove option"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <div>
        <Button type="button" variant="secondary" size="sm" onClick={() => append('')}>
          <Plus className="w-4 h-4 mr-2" />
          Add option
        </Button>
      </div>
    </div>
  );
}

export default function TeachQuizEditor() {
  const { activeSchoolId, isTeacher, isLoading, user } = useSession();
  const nav = useNavigate();
  const qc = useQueryClient();
  const params = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const presetCourseId = urlParams.get('courseId') || '';

  const quizId = (params.quizId || urlParams.get('quizId') || urlParams.get('id') || '').trim();
const isEditing = !!quizId;

  const form = useForm({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
      course_id: presetCourseId || '',
      lesson_id: '',
      passing_score: 70,
      preview_limit_questions: 2,
      shuffle_questions: false,
      time_limit_seconds: '',
      max_attempts: '',
      is_published: false,
      questions: [makeBlankQuestion()],
    },
    mode: 'onBlur',
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion, move: moveQuestion } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const selectedCourseId = form.watch('course_id');

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', activeSchoolId],
    queryFn: () => scopedFilter('Course', activeSchoolId, {}, 'title', 250),
    enabled: !!activeSchoolId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', activeSchoolId, selectedCourseId],
    queryFn: () => scopedFilter('Lesson', activeSchoolId, { course_id: selectedCourseId }, 'order', 250),
    enabled: !!activeSchoolId && !!selectedCourseId,
  });

  const { data: loaded } = useQuery({
    queryKey: ['quiz-full', activeSchoolId, quizId],
    queryFn: () => loadQuizForAccess({ schoolId: activeSchoolId, quizId, access: 'FULL', isTeacher: true }),
    enabled: !!activeSchoolId && !!quizId,
  });

  useEffect(() => {
    if (!loaded?.quiz) return;

    const quiz = loaded.quiz;
    const qs = (loaded.questions || []).map((q) => {
      const opts = Array.isArray(q.options) ? q.options : [];
      const correctIndex = Math.max(0, opts.indexOf(q.correct_answer));
      return {
        prompt: q.question || '',
        prompt_hebrew: q.question_hebrew || '',
        options: opts.length ? opts : ['', ''],
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        explanation: q.explanation || '',
        points: Number.isFinite(q.points) ? q.points : 1,
      };
    });

    form.reset({
      title: quiz.title || '',
      description: quiz.description || '',
      course_id: quiz.course_id ? String(quiz.course_id) : '',
      lesson_id: quiz.lesson_id ? String(quiz.lesson_id) : '',
      passing_score: quiz.passing_score ?? 70,
      preview_limit_questions: quiz.preview_limit_questions ?? 2,
      shuffle_questions: !!quiz.shuffle_questions,
      time_limit_seconds: quiz.time_limit_seconds ?? '',
      max_attempts: quiz.max_attempts ?? '',
      is_published: !!quiz.is_published,
      questions: qs.length ? qs : [makeBlankQuestion()],
    });
  }, [loaded?.quiz]);

  const save = useMutation({
    mutationFn: async (values) => {
      if (!activeSchoolId) throw new Error('No active school');

      const questions = (values.questions || []).map((q) => ({
        prompt: q.prompt,
        prompt_hebrew: q.prompt_hebrew,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        points: q.points,
      }));

      const id = await saveQuiz({
        schoolId: activeSchoolId,
        quizId: isEditing ? quizId : null,
        meta: {
          title: values.title,
          description: values.description,
          course_id: values.course_id,
          lesson_id: values.lesson_id || null,
          passing_score: values.passing_score,
          preview_limit_questions: values.preview_limit_questions,
          shuffle_questions: values.shuffle_questions,
          time_limit_seconds: values.time_limit_seconds ? Number(values.time_limit_seconds) : null,
          max_attempts: values.max_attempts ? Number(values.max_attempts) : null,
          is_published: values.is_published,
        },
        questions,
        userEmail: user?.email || null,
      });

      return id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ['quizzes', activeSchoolId] });
      qc.invalidateQueries({ queryKey: ['quiz-full', activeSchoolId, id] });
      toast.success('Quiz saved');
      nav('/teach/quizzes');
    },
    onError: (e) => toast.error(String(e?.message || e)),
  });

  if (isLoading) {
    return <PageShell title="Quiz" subtitle="Loading session…" />;
  }

  if (!activeSchoolId) {
    return <PageShell title="Quiz" subtitle="Select a school to manage quizzes." />;
  }

  if (!isTeacher) {
    return <PageShell title="Quiz" subtitle="Teacher access required" />;
  }

  return (
    <PageShell
      title={isEditing ? 'Edit quiz' : 'New quiz'}
      subtitle={isEditing ? 'Refine questions and publish when ready.' : 'Create a quiz and attach it to a course.'}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link to="/teach/quizzes">Back</Link>
          </Button>
          <Button onClick={form.handleSubmit((vals) => save.mutate(vals))} disabled={save.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </>
      }
    >
      <form className="space-y-6" onSubmit={form.handleSubmit((vals) => save.mutate(vals))}>
        <Card>
          <CardHeader>
            <CardTitle>Quiz settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input {...form.register('title')} placeholder="Quiz title" />
                {form.formState.errors.title ? (
                  <p className="text-sm text-destructive">{String(form.formState.errors.title.message)}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Passing score (%)</Label>
                <Input type="number" min={0} max={100} {...form.register('passing_score')} />
              </div>

              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={selectedCourseId}
                  onValueChange={(v) => {
                    form.setValue('course_id', v);
                    form.setValue('lesson_id', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {(courses || []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.title || c.name || 'Course'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.course_id ? (
                  <p className="text-sm text-destructive">{String(form.formState.errors.course_id.message)}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Lesson (optional)</Label>
                <Select
                  value={form.watch('lesson_id') || ''}
                  onValueChange={(v) => form.setValue('lesson_id', v)}
                  disabled={!selectedCourseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCourseId ? 'Attach to a lesson' : 'Select a course first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No lesson</SelectItem>
                    {(lessons || []).map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.title || l.name || `Lesson ${l.order ?? ''}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preview question limit</Label>
                <Input type="number" min={0} max={10} {...form.register('preview_limit_questions')} />
              </div>

              <div className="space-y-2">
                <Label>Time limit (seconds, optional)</Label>
                <Input type="number" min={0} {...form.register('time_limit_seconds')} />
              </div>

              <div className="space-y-2">
                <Label>Max attempts (optional)</Label>
                <Input type="number" min={0} {...form.register('max_attempts')} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <div className="font-medium">Shuffle questions</div>
                  <div className="text-sm text-muted-foreground">Randomize question order for students.</div>
                </div>
                <Switch checked={!!form.watch('shuffle_questions')} onCheckedChange={(v) => form.setValue('shuffle_questions', v)} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <div className="font-medium">Published</div>
                  <div className="text-sm text-muted-foreground">Only published quizzes are visible to students.</div>
                </div>
                <Switch checked={!!form.watch('is_published')} onCheckedChange={(v) => form.setValue('is_published', v)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {form.formState.errors.questions ? (
              <p className="text-sm text-destructive mb-3">{String(form.formState.errors.questions.message)}</p>
            ) : null}

            <DragDropContext
              onDragEnd={(result) => {
                if (!result.destination) return;
                moveQuestion(result.source.index, result.destination.index);
              }}
            >
              <Droppable droppableId="questions">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                    {questionFields.map((qField, index) => {
                      const correctIndexValue = form.watch(`questions.${index}.correctIndex`);
                      return (
                        <Draggable key={qField.id} draggableId={qField.id} index={index}>
                          {(d) => (
                            <div
                              ref={d.innerRef}
                              {...d.draggableProps}
                              className="rounded-lg border p-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div {...d.dragHandleProps} className="cursor-grab text-muted-foreground">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <div className="font-medium">Question {index + 1}</div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeQuestion(index)}
                                  disabled={questionFields.length <= 1}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <Separator className="my-4" />

                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label>Question</Label>
                                  <Textarea rows={2} {...form.register(`questions.${index}.prompt`)} placeholder="Enter question" />
                                  {form.formState.errors.questions?.[index]?.prompt ? (
                                    <p className="text-sm text-destructive">{String(form.formState.errors.questions[index].prompt.message)}</p>
                                  ) : null}
                                </div>

                                <div className="space-y-2">
                                  <Label>Hebrew question (optional)</Label>
                                  <Textarea rows={2} {...form.register(`questions.${index}.prompt_hebrew`)} placeholder="שאלה בעברית (אופציונלי)" dir="rtl" />
                                </div>

                                <div className="space-y-2">
                                  <Label>Answers (select correct)</Label>
                                  <OptionsEditor
                                    control={form.control}
                                    register={form.register}
                                    qIndex={index}
                                    correctIndexValue={correctIndexValue}
                                    setCorrectIndex={(v) => form.setValue(`questions.${index}.correctIndex`, v)}
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Points</Label>
                                    <Input type="number" min={1} max={100} {...form.register(`questions.${index}.points`)} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Explanation (optional)</Label>
                                    <Textarea rows={2} {...form.register(`questions.${index}.explanation`)} placeholder="Explain why the answer is correct" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <div className="pt-4">
              <Button type="button" variant="secondary" onClick={() => appendQuestion(makeBlankQuestion())}>
                <Plus className="w-4 h-4 mr-2" />
                Add question
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageShell>
  );
}
