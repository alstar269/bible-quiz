'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { isSupabaseConfigured, fetchWeeklyVerses } from '@/lib/supabase-api'
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

export default function WeeklyPage() {
  const [verses, setVerses] = useState<WeeklyVerse[]>([])

  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured) {
        const data = await fetchWeeklyVerses()
        setVerses(data)
      } else {
        setVerses(loadWeeklyVersesLocal())
      }
    }
    void load()
  }, [])

  const latestVerse = verses[0]

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <Link href="/" className="text-[#636E72] text-sm mb-4 inline-block">
          ← 홈으로
        </Link>
        <div className="text-6xl mb-3">🕊️</div>
        <h1 className="text-3xl font-extrabold text-[#2D3436]">주간 말씀</h1>
      </motion.div>

      <div className="w-full max-w-sm space-y-6">
        {latestVerse ? (
          <>
            {/* 이번 주 말씀 카드 */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="game-card text-center border-2 border-[#4A90D9]"
            >
              <p className="text-sm text-[#4A90D9] font-bold mb-1">
                이번 주 말씀
              </p>
              <p className="text-lg font-bold text-[#FFB347] mb-3">
                📖 {latestVerse.verseRef}
              </p>
              <p className="text-xl font-medium leading-relaxed text-[#2D3436]">
                &ldquo;{latestVerse.verseText}&rdquo;
              </p>
            </motion.div>

            {/* 연습 퀴즈 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/weekly/quiz" className="block">
                <div className="game-card text-center hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#7ED321]">
                  <div className="text-4xl mb-2">🎯</div>
                  <h2 className="text-xl font-bold mb-1">연습 퀴즈</h2>
                  <p className="text-sm text-[#636E72]">
                    이번 주 말씀으로 퀴즈를 풀어보세요!
                  </p>
                </div>
              </Link>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="game-card text-center"
          >
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg text-[#636E72]">
              아직 등록된 주간 말씀이 없어요
            </p>
            <p className="text-sm text-[#B2BEC3] mt-2">
              선생님께 주간 말씀을 등록해달라고 해보세요!
            </p>
          </motion.div>
        )}

        {/* 이전 말씀 목록 */}
        {verses.length > 1 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="game-card"
          >
            <h2 className="text-lg font-bold mb-3">지난 말씀</h2>
            <div className="space-y-2">
              {verses.slice(1, 6).map((v) => (
                <div key={v.id} className="p-3 bg-[#F8F9FA] rounded-2xl">
                  <p className="text-sm text-[#4A90D9] font-bold">
                    {v.verseRef}
                  </p>
                  <p className="text-sm text-[#636E72]">{v.verseText}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
