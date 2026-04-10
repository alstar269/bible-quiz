'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'
import HomeButton from '@/components/common/HomeButton'

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  waiting: { text: '대기 중', color: 'bg-[#FFF3E0] text-[#FFB347]' },
  playing: { text: '진행 중', color: 'bg-[#E8F4FD] text-[#4A90D9]' },
  finished: { text: '완료', color: 'bg-[#E8F5E9] text-[#7ED321]' },
}

export default function DashboardPage() {
  const router = useRouter()
  const { allQuizzes, loadAllQuizzes } = useGameStore()

  useEffect(() => {
    void loadAllQuizzes()
  }, [loadAllQuizzes])

  // 주기적 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      void loadAllQuizzes()
    }, 5000)
    return () => clearInterval(interval)
  }, [loadAllQuizzes])

  return (
    <div className="flex flex-col items-center min-h-screen p-6 pt-20">
      <HomeButton />

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-extrabold text-[#2D3436]">
          📊 퀴즈 이력 / 점수
        </h1>
        <p className="text-base text-[#636E72] mt-1">
          지난 퀴즈 결과와 학생 점수를 확인하세요
        </p>
      </motion.div>

      <div className="w-full max-w-lg space-y-4">
        {allQuizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="game-card text-center"
          >
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg text-[#636E72]">아직 만든 퀴즈가 없어요</p>
            <button
              onClick={() => router.push('/host/create')}
              className="btn-primary mt-4"
            >
              ✏️ 첫 퀴즈 만들기
            </button>
          </motion.div>
        ) : (
          allQuizzes.map((quiz, i) => {
            const status = STATUS_LABEL[quiz.status] ?? STATUS_LABEL.waiting
            return (
              <motion.div
                key={quiz.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/host/dashboard/${quiz.id}`)}
                className="game-card cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-[#4A90D9]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-[#2D3436]">
                    {quiz.title}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                    {status.text}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#636E72]">
                  <span>📝 {quiz.settings.questionCount}문제</span>
                  <span>🔑 {quiz.code}</span>
                  <span>📅 {new Date(quiz.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
