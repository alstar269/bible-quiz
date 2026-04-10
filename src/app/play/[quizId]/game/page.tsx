'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGameStore } from '@/stores/game-store'
import { splitVerseIntoWords } from '@/lib/quiz-engine'

const ENCOURAGE_MESSAGES = [
  '잘했어! 🌟',
  '대단해! ⭐',
  '최고야! 🎉',
  '멋져! 🔥',
  '완벽해! 💯',
  '와우! 🌈',
] as const

const WRONG_MESSAGES = [
  '다시 해볼까? 💪',
  '괜찮아, 힘내! 🤗',
  '거의 다 왔어! 🌱',
  '포기하지 마! ✨',
] as const

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const { quiz, questions, currentQuestionIndex, submitAnswer, loadQuiz } =
    useGameStore()

  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set())
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'wrong'
    message: string
    points: number
  } | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [questionDone, setQuestionDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!quiz) {
      void loadQuiz(quizId)
    }
  }, [quiz, quizId, loadQuiz])

  const currentQuestion = questions[currentQuestionIndex]

  // 타이머
  useEffect(() => {
    if (questionDone) return

    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentQuestionIndex, questionDone])

  // 문제 전환 시 초기화
  useEffect(() => {
    setSelectedWords([])
    setUsedIndices(new Set())
    setFeedback(null)
    setTimeElapsed(0)
    setHintsUsed(0)
    setShowHint(false)
    setQuestionDone(false)
  }, [currentQuestionIndex])

  // 퀴즈 상태 폴링 (출제자가 다음 문제로 넘겼는지 확인)
  useEffect(() => {
    const interval = setInterval(() => {
      void loadQuiz(quizId)
    }, 2000)
    return () => clearInterval(interval)
  }, [quizId, loadQuiz])

  // 게임 종료 시 결과 페이지로
  useEffect(() => {
    if (quiz?.status === 'finished') {
      router.push(`/play/${quizId}/results`)
    }
  }, [quiz?.status, quizId, router])

  const handleSelectWord = useCallback(
    (word: string, index: number) => {
      if (usedIndices.has(index) || questionDone) return

      setSelectedWords((prev) => [...prev, word])
      setUsedIndices((prev) => new Set([...prev, index]))
    },
    [usedIndices, questionDone]
  )

  const handleRemoveWord = useCallback(
    (removeIndex: number) => {
      if (questionDone) return

      const removedWord = selectedWords[removeIndex]
      if (!removedWord || !currentQuestion) return

      // 원래 인덱스 찾기
      const originalIndex = currentQuestion.words.findIndex(
        (w, i) => w === removedWord && usedIndices.has(i)
      )

      setSelectedWords((prev) => prev.filter((_, i) => i !== removeIndex))
      if (originalIndex !== -1) {
        setUsedIndices((prev) => {
          const next = new Set(prev)
          next.delete(originalIndex)
          return next
        })
      }
    },
    [selectedWords, usedIndices, currentQuestion, questionDone]
  )

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || questionDone) return

    if (timerRef.current) clearInterval(timerRef.current)
    setQuestionDone(true)

    const answer = await submitAnswer(
      currentQuestion.id,
      selectedWords,
      timeElapsed,
      hintsUsed
    )

    if (answer.isCorrect) {
      const msg =
        ENCOURAGE_MESSAGES[Math.floor(Math.random() * ENCOURAGE_MESSAGES.length)]
      setFeedback({ type: 'correct', message: msg, points: answer.pointsEarned })

      // confetti 효과
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4A90D9', '#FFB347', '#FF6B9D', '#7ED321'],
      })
    } else {
      const msg =
        WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]
      setFeedback({ type: 'wrong', message: msg, points: 0 })
    }
  }, [
    currentQuestion,
    questionDone,
    selectedWords,
    timeElapsed,
    hintsUsed,
    submitAnswer,
  ])

  const handleHint = () => {
    if (!currentQuestion || !quiz?.settings.enableHints) return
    setShowHint(true)
    setHintsUsed((prev) => prev + 1)
  }

  // 모든 단어가 선택되면 자동 제출
  useEffect(() => {
    if (
      currentQuestion &&
      selectedWords.length === currentQuestion.words.length &&
      !questionDone
    ) {
      const timer = setTimeout(() => void handleSubmit(), 500)
      return () => clearTimeout(timer)
    }
  }, [selectedWords.length, currentQuestion, questionDone, handleSubmit])

  if (!quiz || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-[#636E72]">로딩 중...</p>
      </div>
    )
  }

  const timerLimit = quiz.settings.timerSeconds
  const timeRemaining = timerLimit > 0 ? Math.max(0, timerLimit - timeElapsed) : null
  const correctWords = splitVerseIntoWords(currentQuestion.verseText)

  return (
    <div className="flex flex-col min-h-screen p-4">
      {/* 상단: 문제 번호 + 타이머 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-bold text-[#636E72]">
          {currentQuestionIndex + 1} / {questions.length}
        </span>
        {timeRemaining !== null && (
          <motion.span
            className={`text-xl font-extrabold ${
              timeRemaining <= 10 ? 'text-[#FF6B9D]' : 'text-[#4A90D9]'
            }`}
            animate={timeRemaining <= 10 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            ⏱️ {timeRemaining}초
          </motion.span>
        )}
      </div>

      {/* 프로그레스 */}
      <div className="progress-bar mb-4">
        <div
          className="progress-fill"
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* 성경 위치 */}
      <div className="text-center mb-4">
        <span className="text-lg font-bold text-[#4A90D9]">
          📖 {currentQuestion.verseRef}
        </span>
      </div>

      {/* 힌트 */}
      {quiz.settings.enableHints && !showHint && !questionDone && (
        <button
          onClick={handleHint}
          className="mx-auto mb-3 px-4 py-2 bg-[#FFF3E0] text-[#FFB347] rounded-full text-sm font-bold"
        >
          💡 힌트 보기 (-20점)
        </button>
      )}
      {showHint && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-[#FFB347] mb-3 font-medium"
        >
          첫 단어: &quot;{correctWords[0]}&quot;
        </motion.p>
      )}

      {/* 답안 영역 */}
      <div className="game-card mb-4 min-h-[100px]">
        <p className="text-xs text-[#B2BEC3] mb-2">내가 배열한 순서:</p>
        <div className="flex flex-wrap gap-1">
          {selectedWords.map((word, i) => (
            <motion.button
              key={`selected-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => handleRemoveWord(i)}
              className="answer-slot filled"
            >
              {word}
            </motion.button>
          ))}
          {selectedWords.length < currentQuestion.words.length && (
            <span className="answer-slot">?</span>
          )}
        </div>
      </div>

      {/* 피드백 */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`game-card mb-4 text-center ${
              feedback.type === 'correct'
                ? 'border-2 border-[#7ED321]'
                : 'border-2 border-[#FF6B9D]'
            }`}
          >
            <p className="text-3xl mb-2">{feedback.message}</p>
            {feedback.type === 'correct' && (
              <>
                <p className="text-2xl font-extrabold text-[#7ED321]">
                  +{feedback.points}점
                </p>
                <p className="text-sm text-[#636E72] mt-2">
                  {currentQuestion.verseText}
                </p>
              </>
            )}
            {feedback.type === 'wrong' && (
              <div className="mt-2">
                <p className="text-sm text-[#636E72] mb-1">정답:</p>
                <p className="text-base font-bold text-[#2D3436]">
                  {currentQuestion.verseText}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 단어 버블 영역 */}
      {!questionDone && (
        <div className="flex flex-wrap justify-center gap-2 mt-auto pb-4">
          {currentQuestion.words.map((word, i) => (
            <motion.button
              key={`word-${i}`}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelectWord(word, i)}
              className={`word-bubble ${usedIndices.has(i) ? 'selected' : ''}`}
              disabled={usedIndices.has(i)}
            >
              {word}
            </motion.button>
          ))}
        </div>
      )}

      {/* 제출 / 다음 문제 대기 */}
      {questionDone && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[#B2BEC3] mt-4"
        >
          선생님이 다음 문제로 넘기면 자동으로 이동해요...
        </motion.p>
      )}
    </div>
  )
}
