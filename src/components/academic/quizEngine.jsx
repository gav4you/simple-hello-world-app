// Quiz Engine (v9.0)
//
// Goals:
// - Tenancy-safe reads/writes (school_id enforced)
// - Avoid fetching questions when access is LOCKED
// - Support two storage modes:
//   (A) Preferred: Quiz metadata in Quiz + questions in QuizQuestion
//   (B) Fallback: Questions stored inline in Quiz.questions

import { base44 } from '@/api/base44Client';
import { scopedCreate, scopedDelete, scopedFilter, scopedUpdate } from '@/components/api/scoped';

export const DEFAULT_PREVIEW_QUESTIONS = 2;

export function supportsQuizQuestions() {
  return !!base44?.entities?.QuizQuestion;
}

function safeNum(v, fallback = null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeQuestion(raw) {
  const options = Array.isArray(raw?.options)
    ? raw.options
    : Array.isArray(raw?.choices)
    ? raw.choices
    : [];

  let correct = raw?.correct_answer ?? raw?.correctAnswer ?? null;
  const correctIndex = safeNum(raw?.correctIndex ?? raw?.correct_option, null);
  if (!correct && correctIndex !== null && options[correctIndex] !== undefined) {
    correct = options[correctIndex];
  }

  return {
    question: raw?.question ?? raw?.prompt ?? '',
    question_hebrew: raw?.question_hebrew ?? raw?.prompt_hebrew ?? '',
    options,
    correct_answer: correct ?? '',
    explanation: raw?.explanation ?? raw?.rationale ?? '',
    points: safeNum(raw?.points, 1) ?? 1,
  };
}

export async function listQuizzes({ schoolId, filters = {}, sort = '-created_date', limit = 250 }) {
  if (!schoolId) return [];
  return scopedFilter('Quiz', schoolId, filters, sort, limit);
}

export async function getQuizMeta({ schoolId, quizId }) {
  if (!schoolId || !quizId) return null;
  const rows = await scopedFilter('Quiz', schoolId, { id: quizId }, '-created_date', 1);
  return rows?.[0] || null;
}

export async function getQuizQuestions({ schoolId, quizId, limit = null }) {
  if (!schoolId || !quizId) return [];
  if (!supportsQuizQuestions()) return [];
  return scopedFilter('QuizQuestion', schoolId, { quiz_id: quizId }, 'question_index', limit ?? 1000);
}

function questionsFromInline(quiz, limit = null) {
  const list = Array.isArray(quiz?.questions) ? quiz.questions.map(normalizeQuestion) : [];
  return limit ? list.slice(0, limit) : list;
}

export async function loadQuizForAccess({ schoolId, quizId, access = 'FULL', isTeacher = false }) {
  const quiz = await getQuizMeta({ schoolId, quizId });
  if (!quiz) return { quiz: null, questions: [], access: 'NOT_FOUND' };

  const normalizedAccess = String(access || '').toUpperCase();

  // IMPORTANT: Don't fetch questions when locked (unless teacher previewing).
  if (!isTeacher && normalizedAccess === 'LOCKED') {
    return { quiz, questions: [], access: 'LOCKED' };
  }

  const previewLimit = safeNum(quiz.preview_limit_questions, DEFAULT_PREVIEW_QUESTIONS) ?? DEFAULT_PREVIEW_QUESTIONS;
  const questionLimit = !isTeacher && normalizedAccess === 'PREVIEW' ? previewLimit : null;

  if (supportsQuizQuestions()) {
    const rows = await getQuizQuestions({ schoolId, quizId, limit: questionLimit ?? 1000 });
    const questions = (rows || []).map((r) => normalizeQuestion(r));
    return { quiz, questions: questionLimit ? questions.slice(0, questionLimit) : questions, access: normalizedAccess };
  }

  // Fallback: inline questions (cannot avoid fetching, but we still hide/limit rendering).
  return { quiz, questions: questionsFromInline(quiz, questionLimit), access: normalizedAccess };
}

async function deleteExistingQuestions({ schoolId, quizId }) {
  const existing = await scopedFilter('QuizQuestion', schoolId, { quiz_id: quizId }, 'question_index', 1000);
  for (const q of existing || []) {
    await scopedDelete('QuizQuestion', q.id, schoolId, true);
  }
}

export async function saveQuiz({ schoolId, quizId = null, meta, questions = [], userEmail = null }) {
  if (!schoolId) throw new Error('Missing schoolId');

  const normalizedQuestions = (questions || [])
    .map(normalizeQuestion)
    .filter((q) => q.question && Array.isArray(q.options) && q.options.length >= 2);

  const supports = supportsQuizQuestions();

  const payload = {
    title: meta?.title ?? 'Untitled quiz',
    description: meta?.description ?? '',
    course_id: meta?.course_id ?? null,
    lesson_id: meta?.lesson_id ?? null,
    passing_score: safeNum(meta?.passing_score, 70) ?? 70,
    time_limit_seconds: safeNum(meta?.time_limit_seconds, null),
    shuffle_questions: !!meta?.shuffle_questions,
    max_attempts: safeNum(meta?.max_attempts, null),
    preview_limit_questions: safeNum(meta?.preview_limit_questions, DEFAULT_PREVIEW_QUESTIONS) ?? DEFAULT_PREVIEW_QUESTIONS,
    is_published: !!meta?.is_published,
    questions_count: normalizedQuestions.length,
    schema_version: 1,
    updated_by: userEmail,
  };

  // If QuizQuestion isn't supported, store inline as a fallback.
  if (!supports) {
    payload.questions = normalizedQuestions;
  }

  let id = quizId;

  if (id) {
    await scopedUpdate('Quiz', id, payload, schoolId, true);
  } else {
    const created = await scopedCreate('Quiz', schoolId, { ...payload, created_by: userEmail });
    id = created?.id || created?.data?.id;
  }

  if (!id) throw new Error('Unable to determine quiz id after save');

  if (supports) {
    await deleteExistingQuestions({ schoolId, quizId: id });
    for (let i = 0; i < normalizedQuestions.length; i++) {
      const q = normalizedQuestions[i];
      await scopedCreate('QuizQuestion', schoolId, {
        quiz_id: id,
        question_index: i,
        ...q,
      });
    }
  }

  return id;
}

export async function recordQuizAttempt({ schoolId, quizId, userEmail, score, passed, answers, timeTakenSeconds }) {
  if (!schoolId) throw new Error('Missing schoolId');
  if (!quizId) throw new Error('Missing quizId');
  if (!userEmail) throw new Error('Missing userEmail');

  return scopedCreate('QuizAttempt', schoolId, {
    quiz_id: quizId,
    user_email: userEmail,
    score: safeNum(score, 0) ?? 0,
    passed: !!passed,
    answers: answers ?? [],
    time_taken_seconds: safeNum(timeTakenSeconds, null),
    completed_at: new Date().toISOString(),
  });
}
