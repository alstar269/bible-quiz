'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'
import type { Difficulty, VerseInput } from '@/types'

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy', label: '쉬움', desc: '짧은 구절 + 힌트 표시' },
  { value: 'normal', label: '보통', desc: '기본 난이도' },
  { value: 'hard', label: '어려움', desc: '긴 구절 + 힌트 없음' },
]

const TIMER_OPTIONS = [
  { value: 0, label: '무제한' },
  { value: 30, label: '30초' },
  { value: 60, label: '60초' },
  { value: 90, label: '90초' },
]

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20]

export default function CreateQuizPage() {
  const router = useRouter()
  const createNewQuiz = useGameStore((s) => s.createNewQuiz)

  const [title, setTitle] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [timerSeconds, setTimerSeconds] = useState(60)
  const [verses, setVerses] = useState<VerseInput[]>(
    Array.from({ length: 10 }, () => ({ verseRef: '', verseText: '' }))
  )
  const [step, setStep] = useState<'settings' | 'verses'>('settings')

  const handleQuestionCountChange = (count: number) => {
    setQuestionCount(count)
    setVerses((prev) => {
      if (count > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: count - prev.length }, () => ({
            verseRef: '',
            verseText: '',
          })),
        ]
      }
      return prev.slice(0, count)
    })
  }

  const updateVerse = (index: number, field: keyof VerseInput, value: string) => {
    setVerses((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }

  const filledVerses = verses.filter((v) => v.verseRef && v.verseText)
  const canCreate = filledVerses.length >= 1 && title.trim().length > 0

  const handleCreate = async () => {
    if (!canCreate) return

    const quiz = await createNewQuiz(title.trim(), filledVerses, {
      questionCount: filledVerses.length,
      difficulty,
      timerSeconds,
      enableHints: difficulty !== 'hard',
      enableCombo: true,
    })

    router.push(`/host/${quiz.id}/lobby`)
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6 w-full max-w-lg"
      >
        <button
          onClick={() => (step === 'verses' ? setStep('settings') : router.back())}
          className="text-[#636E72] text-sm mb-4 inline-block"
        >
          ← 뒤로
        </button>
        <h1 className="text-3xl font-extrabold text-[#2D3436]">
          ✏️ 퀴즈 만들기
        </h1>
      </motion.div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {step === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="space-y-6"
            >
              {/* 퀴즈 제목 */}
              <div className="game-card">
                <label className="block text-lg font-bold mb-2">
                  퀴즈 제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 주일학교 4월 2주차"
                  className="w-full p-4 text-lg border-2 border-[#E0E0E0] rounded-2xl focus:border-[#4A90D9] focus:outline-none transition-colors"
                />
              </div>

              {/* 문제 수 */}
              <div className="game-card">
                <label className="block text-lg font-bold mb-3">
                  문제 수
                </label>
                <div className="flex gap-3 flex-wrap">
                  {QUESTION_COUNT_OPTIONS.map((count) => (
                    <button
                      key={count}
                      onClick={() => handleQuestionCountChange(count)}
                      className={`px-6 py-3 rounded-2xl text-lg font-bold transition-all ${
                        questionCount === count
                          ? 'bg-[#4A90D9] text-white shadow-md'
                          : 'bg-[#F0F4F8] text-[#636E72] hover:bg-[#E0E8F0]'
                      }`}
                    >
                      {count}문제
                    </button>
                  ))}
                </div>
              </div>

              {/* 난이도 */}
              <div className="game-card">
                <label className="block text-lg font-bold mb-3">
                  난이도
                </label>
                <div className="flex flex-col gap-3">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDifficulty(opt.value)}
                      className={`p-4 rounded-2xl text-left transition-all ${
                        difficulty === opt.value
                          ? 'bg-[#4A90D9] text-white shadow-md'
                          : 'bg-[#F0F4F8] text-[#636E72] hover:bg-[#E0E8F0]'
                      }`}
                    >
                      <span className="text-lg font-bold">{opt.label}</span>
                      <span className="ml-2 text-sm opacity-80">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 타이머 */}
              <div className="game-card">
                <label className="block text-lg font-bold mb-3">
                  제한 시간
                </label>
                <div className="flex gap-3 flex-wrap">
                  {TIMER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTimerSeconds(opt.value)}
                      className={`px-6 py-3 rounded-2xl text-lg font-bold transition-all ${
                        timerSeconds === opt.value
                          ? 'bg-[#FFB347] text-[#2D3436] shadow-md'
                          : 'bg-[#F0F4F8] text-[#636E72] hover:bg-[#E0E8F0]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 다음 단계 버튼 */}
              <button
                onClick={() => setStep('verses')}
                disabled={!title.trim()}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                다음: 성경 구절 입력 →
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="verses"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-center text-[#636E72] mb-2">
                {questionCount}개의 성경 구절을 입력해주세요
              </p>

              {verses.map((verse, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="game-card"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 bg-[#4A90D9] text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="font-bold">문제 {index + 1}</span>
                    {verse.verseRef && verse.verseText && (
                      <span className="text-[#7ED321] text-sm">✓</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={verse.verseRef}
                    onChange={(e) => updateVerse(index, 'verseRef', e.target.value)}
                    placeholder="성경 위치 (예: 요한복음 3:16)"
                    className="w-full p-3 text-base border-2 border-[#E0E0E0] rounded-xl mb-2 focus:border-[#4A90D9] focus:outline-none"
                  />
                  <textarea
                    value={verse.verseText}
                    onChange={(e) => updateVerse(index, 'verseText', e.target.value)}
                    placeholder="성경 구절을 입력하세요"
                    rows={2}
                    className="w-full p-3 text-base border-2 border-[#E0E0E0] rounded-xl focus:border-[#4A90D9] focus:outline-none resize-none"
                  />
                </motion.div>
              ))}

              <div className="text-center text-sm text-[#636E72] my-2">
                입력된 문제: {filledVerses.length} / {questionCount}
              </div>

              <button
                onClick={handleCreate}
                disabled={!canCreate}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🎉 퀴즈 생성하기!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
