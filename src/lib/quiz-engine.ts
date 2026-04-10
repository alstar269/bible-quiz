import type { Question, Quiz, QuizSettings, VerseInput } from '@/types'
import { shuffleArray } from './shuffle'

/**
 * 6자리 참가 코드 생성
 * 학생들이 쉽게 입력할 수 있도록 숫자로만 구성
 */
export function generateQuizCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/**
 * 고유 ID 생성 (간단한 방식)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 성경 구절 텍스트를 단어 배열로 분리
 * 마침표, 쉼표 등 구두점은 앞 단어에 붙여서 유지
 */
export function splitVerseIntoWords(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
}

/**
 * 구절 입력 데이터로부터 문제를 생성
 * 각 구절의 단어를 분리하고 랜덤으로 섞어서 문제를 만든다.
 */
export function createQuestions(
  quizId: string,
  verses: readonly VerseInput[]
): Question[] {
  return verses.map((verse, index) => {
    const originalWords = splitVerseIntoWords(verse.verseText)
    const shuffledWords = shuffleArray(originalWords)

    return {
      id: generateId(),
      quizId,
      order: index + 1,
      verseRef: verse.verseRef,
      verseText: verse.verseText,
      words: shuffledWords,
    }
  })
}

/**
 * 퀴즈 생성
 */
export function createQuiz(
  title: string,
  settings: QuizSettings
): Quiz {
  return {
    id: generateId(),
    title,
    code: generateQuizCode(),
    status: 'playing',
    settings,
    createdAt: new Date().toISOString(),
    currentQuestion: 0,
  }
}

/**
 * 학생이 배열한 단어 순서가 정답인지 확인
 */
export function checkAnswer(
  selectedWords: readonly string[],
  originalText: string
): boolean {
  const correctWords = splitVerseIntoWords(originalText)

  if (selectedWords.length !== correctWords.length) {
    return false
  }

  return selectedWords.every((word, index) => word === correctWords[index])
}

/**
 * 기본 퀴즈 설정
 */
export const DEFAULT_SETTINGS: QuizSettings = {
  questionCount: 10,
  difficulty: 'normal',
  timerSeconds: 60,
  enableHints: true,
  enableCombo: true,
} as const
