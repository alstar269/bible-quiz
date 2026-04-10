'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'

export default function HostResultsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const { quiz, participants, loadQuiz } = useGameStore()

  useEffect(() => {
    if (!quiz || quiz.id !== quizId) {
      void loadQuiz(quizId)
    }
  }, [quiz, quizId, loadQuiz])

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-[#636E72]">로딩 중...</p>
      </div>
    )
  }

  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score)
  const topThree = sortedParticipants.slice(0, 3)

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      {/* 헤더 */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center mb-8"
      >
        <div className="text-7xl mb-4">🏆</div>
        <h1 className="text-3xl font-extrabold text-[#2D3436]">최종 결과</h1>
        <p className="text-lg text-[#636E72]">{quiz.title}</p>
      </motion.div>

      <div className="w-full max-w-lg space-y-6">
        {/* 시상대 (Top 3) */}
        {topThree.length > 0 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2등 */}
            {topThree[1] && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <div className="game-card p-4 min-w-[100px]">
                  <div className="text-4xl mb-1">🥈</div>
                  <p className="font-bold text-base">{topThree[1].nickname}</p>
                  <p className="text-[#4A90D9] font-extrabold text-lg">
                    {topThree[1].score}점
                  </p>
                </div>
              </motion.div>
            )}
            {/* 1등 */}
            {topThree[0] && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="game-card p-6 min-w-[120px] border-2 border-[#FFB347]">
                  <div className="text-5xl mb-1">🥇</div>
                  <p className="font-extrabold text-xl">{topThree[0].nickname}</p>
                  <p className="text-[#FFB347] font-extrabold text-2xl">
                    {topThree[0].score}점
                  </p>
                </div>
              </motion.div>
            )}
            {/* 3등 */}
            {topThree[2] && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <div className="game-card p-4 min-w-[100px]">
                  <div className="text-4xl mb-1">🥉</div>
                  <p className="font-bold text-base">{topThree[2].nickname}</p>
                  <p className="text-[#4A90D9] font-extrabold text-lg">
                    {topThree[2].score}점
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* 전체 순위 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="game-card"
        >
          <h2 className="text-xl font-bold mb-4">📋 전체 순위</h2>
          <div className="space-y-2">
            {sortedParticipants.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#E8F4FD] text-[#4A90D9] rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="font-bold">{p.nickname}</span>
                </div>
                <span className="font-extrabold text-[#4A90D9]">
                  {p.score}점
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 새 게임 */}
        <button
          onClick={() => router.push('/host')}
          className="btn-secondary w-full text-xl"
        >
          🔄 새 퀴즈 만들기
        </button>
      </div>
    </div>
  )
}
