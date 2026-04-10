'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { shuffleArray } from '@/lib/shuffle'
import { splitVerseIntoWords, generateId } from '@/lib/quiz-engine'
import { isSupabaseConfigured, fetchWeeklyVerses } from '@/lib/supabase-api'
import HomeButton from '@/components/common/HomeButton'
import type { WeeklyVerse } from '@/types'

function loadWeeklyVersesLocal(): WeeklyVerse[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('bible-quiz-weekly-verses')
  if (!raw) return []
  try {
    return JSON.parse(raw) as WeeklyVerse[]
  } catch {
    return []
  }
}

function saveAttempt(verseId: string, nickname: string, isCorrect: boolean, timeTaken: number) {
  if (typeof window === 'undefined') return
  const key = 'bible-quiz-weekly-attempts'
  const raw = localStorage.getItem(key)
  const existing = raw ? JSON.parse(raw) : []
  existing.push({
    id: generateId(),
    weeklyVerseId: verseId,
    nickname,
    isCorrect,
    timeTaken,
    pointsEarned: isCorrect ? 100 : 0,
    attemptedAt: new Date().toISOString(),
  })
  localStorage.setItem(key, JSON.stringify(existing))
}

export default function WeeklyQuizPage() {
  const router = useRouter()
  const [verse, setVerse] = useState<WeeklyVerse | null>(null)
  const [nickname, setNickname] = useState('')
  const [step, setStep] = useState<'nickname' | 'quiz' | 'result'>('nickname')
  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set())
  const [isCorrect, setIsCorrect] = useState(false)
  const [startTime, setStartTime] = useState(0)

  useEffect(() => {
    async function load() {
      const verses = isSupabaseConfigured
        ? await fetchWeeklyVerses()
        : loadWeeklyVersesLocal()
      if (verses.length > 0) {
        setVerse(verses[0])
      }
    }
    void load()
  }, [])

  const startQuiz = () => {
    if (!nickname.trim() || !verse) return
    const words = splitVerseIntoWords(verse.verseText)
    setShuffledWords(shuffleArray(words))
    setStartTime(Date.now())
    setStep('quiz')
  }

  const handleSelectWord = useCallback(
    (word: string, index: number) => {
      if (usedIndices.has(index)) return
      setSelectedWords((prev) => [...prev, word])
      setUsedIndices((prev) => new Set([...prev, index]))
    },
    [usedIndices]
  )

  const handleRemoveWord = useCallback(
    (removeIndex: number) => {
      const removedWord = selectedWords[removeIndex]
      if (!removedWord) return

      const originalIndex = shuffledWords.findIndex(
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
    [selectedWords, shuffledWords, usedIndices]
  )

  // 자동 제출
  useEffect(() => {
    if (!verse || step !== 'quiz') return
    const correctWords = splitVerseIntoWords(verse.verseText)
    if (selectedWords.length !== correctWords.length) return

    const correct = selectedWords.every((w, i) => w === correctWords[i])
    const timeTaken = Math.round((Date.now() - startTime) / 1000)

    setIsCorrect(correct)
    saveAttempt(verse.id, nickname, correct, timeTaken)

    if (correct) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4A90D9', '#FFB347', '#FF6B9D', '#7ED321'],
      })
    }

    setTimeout(() => setStep('result'), 500)
  }, [selectedWords, verse, step, startTime, nickname])

  if (!verse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-lg text-[#636E72]">등록된 주간 말씀이 없어요</p>
        <button onClick={() => router.push('/')} className="btn-secondary mt-4">
          홈으로
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 pt-20">
      <HomeButton />
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl font-extrabold text-[#2D3436]">
          🎯 주간 말씀 퀴즈
        </h1>
      </motion.div>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 'nickname' && (
            <motion.div
              key="nickname"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="space-y-4"
            >
              <div className="game-card text-center">
                <p className="text-lg font-bold mb-3">이름을 알려줘! 👋</p>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임"
                  maxLength={10}
                  className="w-full p-4 text-xl text-center font-bold border-2 border-[#E0E0E0] rounded-2xl focus:border-[#FFB347] focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                onClick={startQuiz}
                disabled={!nickname.trim()}
                className="btn-primary w-full disabled:opacity-40"
              >
                시작! 🚀
              </button>
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-center">
                <span className="text-lg font-bold text-[#4A90D9]">
                  📖 {verse.verseRef}
                </span>
              </div>

              {/* 답안 영역 */}
              <div className="game-card min-h-[80px]">
                <p className="text-xs text-[#B2BEC3] mb-2">내가 배열한 순서:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedWords.map((word, i) => (
                    <motion.button
                      key={`s-${i}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => handleRemoveWord(i)}
                      className="answer-slot filled"
                    >
                      {word}
                    </motion.button>
                  ))}
                  {selectedWords.length < shuffledWords.length && (
                    <span className="answer-slot">?</span>
                  )}
                </div>
              </div>

              {/* 단어 버블 */}
              <div className="flex flex-wrap justify-center gap-2">
                {shuffledWords.map((word, i) => (
                  <motion.button
                    key={`w-${i}`}
                    initial={{ y: 20, opacity: 0 }}
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
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <div className="game-card text-center">
                <div className="text-6xl mb-3">
                  {isCorrect ? '🎉' : '💪'}
                </div>
                <h2 className="text-2xl font-extrabold mb-2">
                  {isCorrect ? '정답!' : '다음에 다시 도전해봐!'}
                </h2>
                <div className="p-4 bg-[#F8F9FA] rounded-2xl mt-4">
                  <p className="text-sm text-[#4A90D9] font-bold">
                    {verse.verseRef}
                  </p>
                  <p className="text-base mt-1">{verse.verseText}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setStep('quiz')
                  setSelectedWords([])
                  setUsedIndices(new Set())
                  const words = splitVerseIntoWords(verse.verseText)
                  setShuffledWords(shuffleArray(words))
                  setStartTime(Date.now())
                }}
                className="btn-primary w-full"
              >
                🔄 다시 도전!
              </button>
              <button
                onClick={() => router.push('/weekly')}
                className="btn-secondary w-full"
              >
                ← 돌아가기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
