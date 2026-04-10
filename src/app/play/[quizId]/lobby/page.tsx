'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'

export default function PlayerLobbyPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const { quiz, participants, loadQuiz } = useGameStore()

  // 게임 시작 폴링
  useEffect(() => {
    const interval = setInterval(() => {
      void loadQuiz(quizId)
    }, 2000)
    return () => clearInterval(interval)
  }, [quizId, loadQuiz])

  // 게임 시작되면 자동 이동
  useEffect(() => {
    if (quiz?.status === 'playing') {
      router.push(`/play/${quizId}/game`)
    }
  }, [quiz?.status, quizId, router])

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-[#636E72]">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
        className="text-center mb-8"
      >
        <div className="text-7xl mb-4">⏳</div>
        <h1 className="text-3xl font-extrabold text-[#2D3436] mb-2">
          대기 중...
        </h1>
        <p className="text-lg text-[#636E72]">
          선생님이 게임을 시작하면 자동으로 넘어가요!
        </p>
      </motion.div>

      <div className="w-full max-w-sm">
        <div className="game-card">
          <p className="text-lg font-bold text-center mb-4">
            {quiz.title}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {participants.map((p, i) => (
              <motion.span
                key={p.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#E8F4FD] text-[#4A90D9] px-4 py-2 rounded-full font-bold"
              >
                {p.nickname}
              </motion.span>
            ))}
          </div>
          <p className="text-center text-[#B2BEC3] mt-4">
            {participants.length}명 참가 중
          </p>
        </div>
      </div>

      {/* 대기 애니메이션 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        className="mt-8 text-4xl"
      >
        🌟
      </motion.div>
    </div>
  )
}
