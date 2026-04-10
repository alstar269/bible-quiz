'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'
import HomeButton from '@/components/common/HomeButton'

export default function QuizDetailPage() {
  const params = useParams()
  const quizId = params.quizId as string

  const { quiz, questions, participants, loadQuiz } = useGameStore()

  useEffect(() => {
    void loadQuiz(quizId)
  }, [quizId, loadQuiz])

  // 주기적 새로고침 (진행 중인 퀴즈 점수 반영)
  useEffect(() => {
    const interval = setInterval(() => {
      void loadQuiz(quizId)
    }, 5000)
    return () => clearInterval(interval)
  }, [quizId, loadQuiz])

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-[#636E72]">로딩 중...</p>
      </div>
    )
  }

  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col items-center min-h-screen p-6 pt-20">
      <HomeButton />

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl font-extrabold text-[#2D3436]">
          📊 {quiz.title}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-2 text-sm text-[#636E72]">
          <span>🔑 {quiz.code}</span>
          <span>📝 {questions.length}문제</span>
          <span>👥 {participants.length}명</span>
        </div>
      </motion.div>

      <div className="w-full max-w-lg space-y-6">
        {/* 요약 카드 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="game-card"
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[#E8F4FD] rounded-2xl">
              <p className="text-2xl font-extrabold text-[#4A90D9]">
                {participants.length}
              </p>
              <p className="text-xs text-[#636E72]">참가자</p>
            </div>
            <div className="p-3 bg-[#FFF3E0] rounded-2xl">
              <p className="text-2xl font-extrabold text-[#FFB347]">
                {sortedParticipants.length > 0
                  ? Math.round(
                      sortedParticipants.reduce((sum, p) => sum + p.score, 0) /
                        sortedParticipants.length
                    )
                  : 0}
              </p>
              <p className="text-xs text-[#636E72]">평균 점수</p>
            </div>
            <div className="p-3 bg-[#E8F5E9] rounded-2xl">
              <p className="text-2xl font-extrabold text-[#7ED321]">
                {sortedParticipants[0]?.score ?? 0}
              </p>
              <p className="text-xs text-[#636E72]">최고 점수</p>
            </div>
          </div>
        </motion.div>

        {/* 학생 점수 목록 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="game-card"
        >
          <h2 className="text-lg font-bold mb-4">🏆 학생별 점수</h2>
          {sortedParticipants.length === 0 ? (
            <p className="text-center text-[#B2BEC3] py-4">
              아직 참가한 학생이 없어요
            </p>
          ) : (
            <div className="space-y-2">
              {sortedParticipants.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {i === 0
                        ? '🥇'
                        : i === 1
                        ? '🥈'
                        : i === 2
                        ? '🥉'
                        : `${i + 1}`}
                    </span>
                    <span className="font-bold">{p.nickname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.combo > 0 && (
                      <span className="text-xs bg-[#FFE0E0] text-[#FF6B9D] px-2 py-1 rounded-full">
                        🔥 {p.combo}콤보
                      </span>
                    )}
                    <span className="font-extrabold text-[#4A90D9] text-lg">
                      {p.score}점
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 문제 목록 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="game-card"
        >
          <h2 className="text-lg font-bold mb-4">📖 출제된 문제</h2>
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q.id} className="p-3 bg-[#F8F9FA] rounded-2xl">
                <p className="text-sm text-[#4A90D9] font-bold">
                  {q.order}. {q.verseRef}
                </p>
                <p className="text-sm text-[#636E72]">{q.verseText}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
