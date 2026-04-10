'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/game-store'
import HomeButton from '@/components/common/HomeButton'

function PlayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [code, setCode] = useState(searchParams.get('code') ?? '')
  const [nickname, setNickname] = useState('')
  const [step, setStep] = useState<'code' | 'nickname'>('code')
  const [error, setError] = useState('')

  const { joinQuiz, loadQuizByCode, quiz } = useGameStore()

  // URL에 code가 있으면 자동으로 다음 단계
  useEffect(() => {
    const urlCode = searchParams.get('code')
    if (urlCode && urlCode.length === 6) {
      setCode(urlCode)
      void loadQuizByCode(urlCode).then((found) => {
        if (found) setStep('nickname')
      })
    }
  }, [searchParams, loadQuizByCode])

  const handleCodeSubmit = async () => {
    setError('')
    if (code.length !== 6) {
      setError('6자리 코드를 입력해주세요')
      return
    }
    const found = await loadQuizByCode(code)
    if (!found) {
      setError('퀴즈를 찾을 수 없어요. 코드를 확인해주세요!')
      return
    }
    setStep('nickname')
  }

  const handleJoin = async () => {
    setError('')
    if (nickname.trim().length < 1) {
      setError('이름을 입력해주세요!')
      return
    }
    if (nickname.trim().length > 10) {
      setError('이름은 10글자까지 가능해요')
      return
    }

    const participant = await joinQuiz(code, nickname.trim())
    if (!participant) {
      setError('이미 같은 이름이 있어요. 다른 이름을 써주세요!')
      return
    }

    router.push(`/play/${quiz?.id}/lobby`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 pt-20">
      <HomeButton />
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        {step === 'nickname' && (
          <button onClick={() => setStep('code')} className="text-[#636E72] text-sm mb-4 inline-block">
            ← 코드 입력으로
          </button>
        )}
        <div className="text-6xl mb-3">🙋</div>
        <h1 className="text-3xl font-extrabold text-[#2D3436]">퀴즈 참가</h1>
      </motion.div>

      <div className="w-full max-w-sm">
        {step === 'code' ? (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <div className="game-card">
              <label className="block text-lg font-bold mb-3 text-center">
                참가 코드를 입력해요!
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full p-5 text-4xl text-center font-extrabold tracking-[0.3em] border-3 border-[#E0E0E0] rounded-2xl focus:border-[#4A90D9] focus:outline-none"
                autoFocus
              />
              {error && (
                <p className="text-[#FF6B9D] text-center mt-2 font-medium">
                  {error}
                </p>
              )}
            </div>
            <button
              onClick={handleCodeSubmit}
              disabled={code.length !== 6}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              확인 →
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            <div className="game-card">
              <label className="block text-lg font-bold mb-3 text-center">
                이름을 알려줘! 👋
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임 입력"
                maxLength={10}
                className="w-full p-5 text-2xl text-center font-bold border-3 border-[#E0E0E0] rounded-2xl focus:border-[#FFB347] focus:outline-none"
                autoFocus
              />
              {error && (
                <p className="text-[#FF6B9D] text-center mt-2 font-medium">
                  {error}
                </p>
              )}
            </div>
            <button
              onClick={handleJoin}
              disabled={!nickname.trim()}
              className="btn-secondary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🎮 참가하기!
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-[#636E72]">로딩 중...</p>
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  )
}
