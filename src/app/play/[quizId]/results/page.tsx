'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'
import HomeButton from '@/components/common/HomeButton'

export default function PlayerResultsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const { quiz, participants, myParticipantId, answers, loadQuiz } =
    useGameStore()

  useEffect(() => {
    if (!quiz) {
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
  const myRank =
    sortedParticipants.findIndex((p) => p.id === myParticipantId) + 1
  const me = participants.find((p) => p.id === myParticipantId)
  const myAnswers = answers.filter((a) => a.participantId === myParticipantId)
  const correctCount = myAnswers.filter((a) => a.isCorrect).length

  return (
    <div className="flex flex-col items-center min-h-screen p-6 pt-20">
      <HomeButton />
      {/* 내 결과 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center mb-8"
      >
        <div className="text-7xl mb-4">
          {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '⭐'}
        </div>
        <h1 className="text-3xl font-extrabold text-[#2D3436] mb-1">
          {me?.nickname ?? '참가자'}
        </h1>
        <p className="text-5xl font-extrabold text-[#4A90D9] mb-2">
          {me?.score ?? 0}점
        </p>
        <p className="text-lg text-[#636E72]">
          {sortedParticipants.length}명 중 {myRank}등
        </p>
      </motion.div>

      <div className="w-full max-w-sm space-y-6">
        {/* 내 성적 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="game-card"
        >
          <h2 className="text-lg font-bold mb-3">📊 내 성적</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-[#E8F4FD] rounded-2xl">
              <p className="text-2xl font-extrabold text-[#4A90D9]">
                {correctCount}
              </p>
              <p className="text-sm text-[#636E72]">맞힌 문제</p>
            </div>
            <div className="text-center p-3 bg-[#FFF3E0] rounded-2xl">
              <p className="text-2xl font-extrabold text-[#FFB347]">
                {myAnswers.length - correctCount}
              </p>
              <p className="text-sm text-[#636E72]">틀린 문제</p>
            </div>
          </div>
        </motion.div>

        {/* 전체 순위 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="game-card"
        >
          <h2 className="text-lg font-bold mb-3">🏆 전체 순위</h2>
          <div className="space-y-2">
            {sortedParticipants.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-2xl ${
                  p.id === myParticipantId
                    ? 'bg-[#4A90D9] text-white'
                    : 'bg-[#F8F9FA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <span className="font-bold">{p.nickname}</span>
                </div>
                <span className="font-extrabold">{p.score}점</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 홈으로 */}
        <button
          onClick={() => router.push('/')}
          className="btn-secondary w-full"
        >
          🏠 홈으로
        </button>
      </div>
    </div>
  )
}
