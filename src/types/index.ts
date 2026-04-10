// ============================================
// 성경퀴즈 앱 타입 정의
// ============================================

export type QuizStatus = 'waiting' | 'playing' | 'finished'
export type Difficulty = 'easy' | 'normal' | 'hard'

export interface QuizSettings {
  readonly questionCount: number
  readonly difficulty: Difficulty
  readonly timerSeconds: number // 0 = 무제한
  readonly enableHints: boolean
  readonly enableCombo: boolean
}

export interface Quiz {
  readonly id: string
  readonly title: string
  readonly code: string // 6자리 참가 코드
  readonly status: QuizStatus
  readonly settings: QuizSettings
  readonly createdAt: string
  readonly currentQuestion: number // 현재 진행 중인 문제 번호
}

export interface Question {
  readonly id: string
  readonly quizId: string
  readonly order: number
  readonly verseRef: string // "요한복음 3:16"
  readonly verseText: string // 원문
  readonly words: readonly string[] // 셔플된 단어 배열
}

export interface Participant {
  readonly id: string
  readonly quizId: string
  readonly nickname: string
  readonly score: number
  readonly combo: number
  readonly joinedAt: string
  readonly isActive: boolean
}

export interface Answer {
  readonly id: string
  readonly participantId: string
  readonly questionId: string
  readonly selectedOrder: readonly string[]
  readonly isCorrect: boolean
  readonly timeTaken: number // 초
  readonly hintsUsed: number
  readonly pointsEarned: number
}

export interface WeeklyVerse {
  readonly id: string
  readonly verseRef: string
  readonly verseText: string
  readonly weekStart: string
  readonly createdAt: string
}

export interface WeeklyQuizAttempt {
  readonly id: string
  readonly weeklyVerseId: string
  readonly nickname: string
  readonly isCorrect: boolean
  readonly timeTaken: number
  readonly pointsEarned: number
  readonly attemptedAt: string
}

// 게임 진행 상태
export interface GameState {
  readonly quiz: Quiz | null
  readonly questions: readonly Question[]
  readonly participants: readonly Participant[]
  readonly currentQuestionIndex: number
  readonly answers: readonly Answer[]
}

// 점수 계산 결과
export interface ScoreResult {
  readonly basePoints: number
  readonly timeBonus: number
  readonly comboMultiplier: number
  readonly hintPenalty: number
  readonly totalPoints: number
}

// 구절 입력 폼 데이터
export interface VerseInput {
  readonly verseRef: string
  readonly verseText: string
}
