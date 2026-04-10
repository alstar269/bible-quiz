'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { useGameStore } from '@/stores/game-store'
import HomeButton from '@/components/common/HomeButton'

export default function HostLobbyPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const { quiz, participants, loadQuiz, startGame } = useGameStore()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!quiz || quiz.id !== quizId) {
      void loadQuiz(quizId)
    }
  }, [quiz, quizId, loadQuiz])

  // 참가자 목록 폴링
  useEffect(() => {
    const interval = setInterval(() => {
      void loadQuiz(quizId)
    }, 2000)
    return () => clearInterval(interval)
  }, [quizId, loadQuiz])

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-[#636E72]">퀴즈를 불러오는 중...</p>
      </div>
    )
  }

  const quizUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/play?code=${quiz.code}`
    : ''

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(quiz.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 클립보드 접근 실패 시 무시
    }
  }

  const handleStart = async () => {
    await startGame()
    router.push('/host/dashboard')
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 pt-20">
      <HomeButton />
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-extrabold text-[#2D3436] mb-1">
          🎮 대기실
        </h1>
        <p className="text-lg text-[#636E72]">{quiz.title}</p>
      </motion.div>

      <div className="w-full max-w-md space-y-6">
        {/* 참가 코드 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="game-card text-center"
        >
          <p className="text-lg font-bold mb-3">참가 코드</p>
          <button
            onClick={handleCopyCode}
            className="text-5xl font-extrabold tracking-[0.3em] text-[#4A90D9] mb-2 cursor-pointer hover:text-[#3A7BC8] transition-colors"
          >
            {quiz.code}
          </button>
          <p className="text-sm text-[#636E72]">
            {copied ? '✅ 복사됨!' : '터치하면 복사돼요'}
          </p>
        </motion.div>

        {/* QR 코드 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="game-card flex flex-col items-center"
        >
          <p className="text-lg font-bold mb-4">QR코드로 참가</p>
          {quizUrl && (
            <QRCodeSVG
              value={quizUrl}
              size={200}
              bgColor="#FFFFFF"
              fgColor="#2D3436"
              level="M"
              includeMargin
            />
          )}
          <p className="text-sm text-[#636E72] mt-3">
            카메라로 스캔하면 바로 참가!
          </p>
        </motion.div>

        {/* 참가자 목록 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="game-card"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-bold">참가자</p>
            <span className="bg-[#4A90D9] text-white px-3 py-1 rounded-full text-sm font-bold">
              {participants.length}명
            </span>
          </div>
          {participants.length === 0 ? (
            <p className="text-center text-[#B2BEC3] py-8">
              참가자를 기다리는 중...
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {participants.map((p, i) => (
                <motion.span
                  key={p.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#E8F4FD] text-[#4A90D9] px-4 py-2 rounded-full font-bold text-base"
                >
                  {p.nickname}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>

        {/* 게임 시작 버튼 */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={handleStart}
          disabled={participants.length === 0}
          className="btn-primary w-full text-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🚀 게임 시작! ({participants.length}명 참가)
        </motion.button>
      </div>
    </div>
  )
}
