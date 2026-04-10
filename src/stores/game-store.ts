'use client'

import { create } from 'zustand'
import type {
  Answer,
  Participant,
  Question,
  Quiz,
  QuizSettings,
  VerseInput,
} from '@/types'
import {
  createQuiz,
  createQuestions,
  checkAnswer,
  generateId,
  DEFAULT_SETTINGS,
} from '@/lib/quiz-engine'
import { calculateScore } from '@/lib/scoring'
import { isSupabaseConfigured } from '@/lib/supabase-api'
import * as api from '@/lib/supabase-api'

// ============================================
// 로컬 스토리지 헬퍼 (Supabase 미설정 시 폴백)
// ============================================

function saveToStorage(key: string, data: unknown): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`bible-quiz-${key}`, JSON.stringify(data))
  }
}

function loadFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(`bible-quiz-${key}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

// ============================================
// 게임 스토어 (Supabase 우선, localStorage 폴백)
// ============================================

interface GameStore {
  readonly quiz: Quiz | null
  readonly questions: readonly Question[]
  readonly participants: readonly Participant[]
  readonly answers: readonly Answer[]
  readonly currentQuestionIndex: number
  readonly myParticipantId: string | null

  // 출제자 액션
  readonly createNewQuiz: (
    title: string,
    verses: readonly VerseInput[],
    settings?: Partial<QuizSettings>
  ) => Promise<Quiz>
  readonly startGame: () => Promise<void>
  readonly nextQuestion: () => Promise<void>
  readonly finishGame: () => Promise<void>

  // 참가자 액션
  readonly joinQuiz: (code: string, nickname: string) => Promise<Participant | null>
  readonly submitAnswer: (
    questionId: string,
    selectedWords: readonly string[],
    timeTaken: number,
    hintsUsed: number
  ) => Promise<Answer>

  // 퀴즈 로드
  readonly loadQuiz: (quizId: string) => Promise<boolean>
  readonly loadQuizByCode: (code: string) => Promise<boolean>

  // 리셋
  readonly reset: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  quiz: null,
  questions: [],
  participants: [],
  answers: [],
  currentQuestionIndex: 0,
  myParticipantId: null,

  createNewQuiz: async (title, verses, settingsOverride) => {
    const settings: QuizSettings = { ...DEFAULT_SETTINGS, ...settingsOverride }
    const quiz = createQuiz(title, settings)
    const questions = createQuestions(quiz.id, verses)

    set({ quiz, questions, participants: [], answers: [], currentQuestionIndex: 0 })

    if (isSupabaseConfigured) {
      await api.insertQuiz(quiz)
      await api.insertQuestions(questions)
    } else {
      saveToStorage(`quiz-${quiz.id}`, quiz)
      saveToStorage(`questions-${quiz.id}`, questions)
      saveToStorage(`quiz-code-${quiz.code}`, quiz.id)
    }

    return quiz
  },

  startGame: async () => {
    const { quiz } = get()
    if (!quiz) return

    const updatedQuiz: Quiz = { ...quiz, status: 'playing', currentQuestion: 1 }
    set({ quiz: updatedQuiz, currentQuestionIndex: 0 })

    if (isSupabaseConfigured) {
      await api.updateQuizStatus(quiz.id, 'playing', 1)
    } else {
      saveToStorage(`quiz-${quiz.id}`, updatedQuiz)
    }
  },

  nextQuestion: async () => {
    const { quiz, currentQuestionIndex, questions } = get()
    if (!quiz) return

    const nextIndex = currentQuestionIndex + 1
    if (nextIndex >= questions.length) {
      await get().finishGame()
      return
    }

    const updatedQuiz: Quiz = { ...quiz, currentQuestion: nextIndex + 1 }
    set({ quiz: updatedQuiz, currentQuestionIndex: nextIndex })

    if (isSupabaseConfigured) {
      await api.updateQuizStatus(quiz.id, 'playing', nextIndex + 1)
    } else {
      saveToStorage(`quiz-${quiz.id}`, updatedQuiz)
    }
  },

  finishGame: async () => {
    const { quiz } = get()
    if (!quiz) return

    const updatedQuiz: Quiz = { ...quiz, status: 'finished' }
    set({ quiz: updatedQuiz })

    if (isSupabaseConfigured) {
      await api.updateQuizStatus(quiz.id, 'finished')
    } else {
      saveToStorage(`quiz-${quiz.id}`, updatedQuiz)
    }
  },

  joinQuiz: async (code, nickname) => {
    let quiz: Quiz | null = null
    let questions: Question[] = []
    let existingParticipants: Participant[] = []

    if (isSupabaseConfigured) {
      quiz = await api.fetchQuizByCode(code)
      if (!quiz) return null
      questions = await api.fetchQuestions(quiz.id)
      existingParticipants = await api.fetchParticipants(quiz.id)
    } else {
      const quizId = loadFromStorage<string>(`quiz-code-${code}`)
      if (!quizId) return null
      quiz = loadFromStorage<Quiz>(`quiz-${quizId}`)
      if (!quiz) return null
      questions = loadFromStorage<Question[]>(`questions-${quizId}`) ?? []
      existingParticipants = loadFromStorage<Participant[]>(`participants-${quizId}`) ?? []
    }

    // 중복 닉네임 체크
    if (existingParticipants.some((p) => p.nickname === nickname)) {
      return null
    }

    const participant: Participant = {
      id: generateId(),
      quizId: quiz.id,
      nickname,
      score: 0,
      combo: 0,
      joinedAt: new Date().toISOString(),
      isActive: true,
    }

    const updatedParticipants = [...existingParticipants, participant]

    set({
      quiz,
      questions,
      participants: updatedParticipants,
      myParticipantId: participant.id,
      currentQuestionIndex: quiz.currentQuestion > 0 ? quiz.currentQuestion - 1 : 0,
      answers: [],
    })

    if (isSupabaseConfigured) {
      await api.insertParticipant(participant)
    } else {
      saveToStorage(`participants-${quiz.id}`, updatedParticipants)
    }

    return participant
  },

  submitAnswer: async (questionId, selectedWords, timeTaken, hintsUsed) => {
    const { quiz, questions, myParticipantId, participants, answers } = get()
    const emptyAnswer: Answer = {
      id: '',
      participantId: myParticipantId ?? '',
      questionId,
      selectedOrder: selectedWords,
      isCorrect: false,
      timeTaken,
      hintsUsed,
      pointsEarned: 0,
    }

    if (!quiz || !myParticipantId) return emptyAnswer

    const question = questions.find((q) => q.id === questionId)
    if (!question) return emptyAnswer

    const isCorrect = checkAnswer(selectedWords, question.verseText)
    const currentParticipant = participants.find((p) => p.id === myParticipantId)
    const currentCombo = currentParticipant?.combo ?? 0
    const newCombo = isCorrect ? currentCombo + 1 : 0

    const scoreResult = calculateScore({
      isCorrect,
      timeTaken,
      timerSeconds: quiz.settings.timerSeconds,
      combo: newCombo,
      hintsUsed,
      enableCombo: quiz.settings.enableCombo,
    })

    const answer: Answer = {
      id: generateId(),
      participantId: myParticipantId,
      questionId,
      selectedOrder: selectedWords,
      isCorrect,
      timeTaken,
      hintsUsed,
      pointsEarned: scoreResult.totalPoints,
    }

    const updatedParticipants = participants.map((p) =>
      p.id === myParticipantId
        ? { ...p, score: p.score + scoreResult.totalPoints, combo: newCombo }
        : p
    )
    const updatedAnswers = [...answers, answer]

    set({ participants: updatedParticipants, answers: updatedAnswers })

    if (isSupabaseConfigured) {
      await api.insertAnswer(answer)
      await api.updateParticipantScore(
        myParticipantId,
        (currentParticipant?.score ?? 0) + scoreResult.totalPoints,
        newCombo
      )
    } else {
      saveToStorage(`participants-${quiz.id}`, updatedParticipants)
      saveToStorage(`answers-${quiz.id}-${myParticipantId}`, updatedAnswers)
    }

    return answer
  },

  loadQuiz: async (quizId) => {
    if (isSupabaseConfigured) {
      const quiz = await api.fetchQuizById(quizId)
      if (!quiz) return false
      const questions = await api.fetchQuestions(quizId)
      const participants = await api.fetchParticipants(quizId)
      set({
        quiz,
        questions,
        participants,
        currentQuestionIndex: quiz.currentQuestion > 0 ? quiz.currentQuestion - 1 : 0,
      })
      return true
    }

    const quiz = loadFromStorage<Quiz>(`quiz-${quizId}`)
    if (!quiz) return false
    const questions = loadFromStorage<Question[]>(`questions-${quizId}`) ?? []
    const participants = loadFromStorage<Participant[]>(`participants-${quizId}`) ?? []
    set({ quiz, questions, participants })
    return true
  },

  loadQuizByCode: async (code) => {
    if (isSupabaseConfigured) {
      const quiz = await api.fetchQuizByCode(code)
      if (!quiz) return false
      return get().loadQuiz(quiz.id)
    }

    const quizId = loadFromStorage<string>(`quiz-code-${code}`)
    if (!quizId) return false
    return get().loadQuiz(quizId)
  },

  reset: () => {
    set({
      quiz: null,
      questions: [],
      participants: [],
      answers: [],
      currentQuestionIndex: 0,
      myParticipantId: null,
    })
  },
}))
