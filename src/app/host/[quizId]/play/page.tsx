'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'
import HomeButton from '@/components/common/HomeButton'

export default function HostPlayPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const { quiz, questions, participants, currentQuestionIndex, loadQuiz, nextQuestion, finishGame } =
    useGameStore()

  useEffect(() => {
    if (!quiz || quiz.id !== quizId) {
      void loadQuiz(quizId)
    }
  }, [quiz, quizId, loadQuiz])

  // 참가자 점수 폴링
  useEffect(() => {
    const interval = setInterval(() => {
      void loadQuiz(quizId)
    }, 3000)
    return () => clearInterval(interval)
  }, [quizId, loadQuiz])

  if (!quiz || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-[#636E72]">로딩 중...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex >= questions.length - 1
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score)

  const handleNext = async () => {
    if (isLastQuestion) {
      await finishGame()
      router.push(`/host/${quizId}/results`)
    } else {
      await nextQuestion()
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 pt-20">
      <HomeButton />
      {/* 상단: 문제 번호 + 프로그레스 */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-[#636E72]">
            문제 {currentQuestionIndex + 1} / {questions.length}
          </span>
          <span className="text-lg font-bold text-[#4A90D9]">
            {quiz.title}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* 현재 문제 (프로젝터 표시용) */}
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="game-card text-center"
          >
            <p className="text-lg text-[#4A90D9] font-bold mb-4">
              📖 {currentQuestion.verseRef}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {currentQuestion.words.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="word-bubble"
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* 실시간 순위 */}
        <div className="game-card">
          <h2 className="text-xl font-bold mb-4">🏆 실시간 순위</h2>
          {sortedParticipants.length === 0 ? (
            <p className="text-center text-[#B2BEC3]">참가자가 없습니다</p>
          ) : (
            <div className="space-y-2">
              {sortedParticipants.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </span>
                    <span className="font-bold text-lg">{p.nickname}</span>
                  </div>
                  <span className="text-xl font-extrabold text-[#4A90D9]">
                    {p.score}점
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* 다음 문제 / 결과 발표 */}
        <button onClick={handleNext} className="btn-primary w-full text-xl">
          {isLastQuestion ? '🎉 결과 발표!' : '➡️ 다음 문제'}
        </button>
      </div>
    </div>
  )
}
