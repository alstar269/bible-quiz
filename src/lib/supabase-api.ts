import { supabase, isSupabaseConfigured } from './supabase'
import type {
  Quiz,
  Question,
  Participant,
  Answer,
  QuizSettings,
  WeeklyVerse,
} from '@/types'

// ============================================
// Supabase ↔ 앱 타입 변환
// DB 컬럼(snake_case) → 앱 타입(camelCase)
// ============================================

function toQuiz(row: Record<string, unknown>): Quiz {
  return {
    id: row.id as string,
    title: row.title as string,
    code: row.code as string,
    status: row.status as Quiz['status'],
    settings: row.settings as QuizSettings,
    currentQuestion: row.current_question as number,
    createdAt: row.created_at as string,
  }
}

function toQuestion(row: Record<string, unknown>): Question {
  return {
    id: row.id as string,
    quizId: row.quiz_id as string,
    order: row.order as number,
    verseRef: row.verse_ref as string,
    verseText: row.verse_text as string,
    words: row.words as string[],
  }
}

function toParticipant(row: Record<string, unknown>): Participant {
  return {
    id: row.id as string,
    quizId: row.quiz_id as string,
    nickname: row.nickname as string,
    score: row.score as number,
    combo: row.combo as number,
    joinedAt: row.joined_at as string,
    isActive: row.is_active as boolean,
  }
}

function toWeeklyVerse(row: Record<string, unknown>): WeeklyVerse {
  return {
    id: row.id as string,
    verseRef: row.verse_ref as string,
    verseText: row.verse_text as string,
    weekStart: row.week_start as string,
    createdAt: row.created_at as string,
  }
}

// ============================================
// 퀴즈 CRUD
// ============================================

export async function insertQuiz(quiz: Quiz): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('quizzes').insert({
    id: quiz.id,
    title: quiz.title,
    code: quiz.code,
    status: quiz.status,
    settings: quiz.settings,
    current_question: quiz.currentQuestion,
    created_at: quiz.createdAt,
  })
  return !error
}

export async function updateQuizStatus(
  quizId: string,
  status: Quiz['status'],
  currentQuestion?: number
): Promise<boolean> {
  if (!supabase) return false
  const update: Record<string, unknown> = { status }
  if (currentQuestion !== undefined) {
    update.current_question = currentQuestion
  }
  const { error } = await supabase.from('quizzes').update(update).eq('id', quizId)
  return !error
}

export async function fetchQuizByCode(code: string): Promise<Quiz | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('code', code)
    .single()
  if (error || !data) return null
  return toQuiz(data)
}

export async function fetchQuizById(id: string): Promise<Quiz | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return toQuiz(data)
}

// ============================================
// 문제 CRUD
// ============================================

export async function insertQuestions(questions: Question[]): Promise<boolean> {
  if (!supabase) return false
  const rows = questions.map((q) => ({
    id: q.id,
    quiz_id: q.quizId,
    order: q.order,
    verse_ref: q.verseRef,
    verse_text: q.verseText,
    words: q.words,
  }))
  const { error } = await supabase.from('questions').insert(rows)
  return !error
}

export async function fetchQuestions(quizId: string): Promise<Question[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order')
  if (error || !data) return []
  return data.map(toQuestion)
}

// ============================================
// 참가자 CRUD
// ============================================

export async function insertParticipant(p: Participant): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('participants').insert({
    id: p.id,
    quiz_id: p.quizId,
    nickname: p.nickname,
    score: p.score,
    combo: p.combo,
    joined_at: p.joinedAt,
    is_active: p.isActive,
  })
  return !error
}

export async function fetchParticipants(quizId: string): Promise<Participant[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('quiz_id', quizId)
    .order('score', { ascending: false })
  if (error || !data) return []
  return data.map(toParticipant)
}

export async function updateParticipantScore(
  participantId: string,
  score: number,
  combo: number
): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('participants')
    .update({ score, combo })
    .eq('id', participantId)
  return !error
}

// ============================================
// 답안 CRUD
// ============================================

export async function insertAnswer(answer: Answer): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('answers').insert({
    id: answer.id,
    participant_id: answer.participantId,
    question_id: answer.questionId,
    selected_order: answer.selectedOrder,
    is_correct: answer.isCorrect,
    time_taken: answer.timeTaken,
    hints_used: answer.hintsUsed,
    points_earned: answer.pointsEarned,
  })
  return !error
}

export async function fetchAnswers(participantId: string): Promise<Answer[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('participant_id', participantId)
  if (error || !data) return []
  return data.map((row) => ({
    id: row.id,
    participantId: row.participant_id,
    questionId: row.question_id,
    selectedOrder: row.selected_order,
    isCorrect: row.is_correct,
    timeTaken: row.time_taken,
    hintsUsed: row.hints_used,
    pointsEarned: row.points_earned,
  }))
}

// ============================================
// 주간 말씀
// ============================================

export async function insertWeeklyVerse(verse: WeeklyVerse): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('weekly_verses').insert({
    id: verse.id,
    verse_ref: verse.verseRef,
    verse_text: verse.verseText,
    week_start: verse.weekStart,
    created_at: verse.createdAt,
  })
  return !error
}

export async function fetchWeeklyVerses(): Promise<WeeklyVerse[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('weekly_verses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  if (error || !data) return []
  return data.map(toWeeklyVerse)
}

// ============================================
// Realtime 구독 헬퍼
// ============================================

export function subscribeToQuiz(
  quizId: string,
  onUpdate: (quiz: Quiz) => void
) {
  if (!supabase) return null
  return supabase
    .channel(`quiz-${quizId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'quizzes', filter: `id=eq.${quizId}` },
      (payload) => onUpdate(toQuiz(payload.new))
    )
    .subscribe()
}

export function subscribeToParticipants(
  quizId: string,
  onUpdate: (participants: Participant[]) => void
) {
  if (!supabase) return null
  return supabase
    .channel(`participants-${quizId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'participants', filter: `quiz_id=eq.${quizId}` },
      async () => {
        // 변경 발생 시 전체 목록 다시 조회
        const participants = await fetchParticipants(quizId)
        onUpdate(participants)
      }
    )
    .subscribe()
}

export function unsubscribe(channelName: string) {
  if (!supabase) return
  supabase.channel(channelName).unsubscribe()
}

export { isSupabaseConfigured }
