'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* 로고 / 타이틀 영역 */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center mb-12"
      >
        <div className="text-7xl mb-4">📖</div>
        <h1 className="text-4xl font-extrabold text-[#2D3436] mb-2">
          성경퀴즈
        </h1>
        <p className="text-xl text-[#636E72] font-medium">
          말씀으로 놀자!
        </p>
      </motion.div>

      {/* 역할 선택 버튼 */}
      <div className="flex flex-col gap-6 w-full max-w-sm">
        {/* 출제자 (선생님) */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/host" className="block">
            <div className="game-card text-center hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#4A90D9]">
              <div className="text-5xl mb-3">👩‍🏫</div>
              <h2 className="text-2xl font-bold text-[#2D3436] mb-1">
                선생님
              </h2>
              <p className="text-base text-[#636E72]">
                퀴즈를 만들고 게임을 시작해요
              </p>
            </div>
          </Link>
        </motion.div>

        {/* 참가자 (학생) */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/play" className="block">
            <div className="game-card text-center hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#FFB347]">
              <div className="text-5xl mb-3">🙋</div>
              <h2 className="text-2xl font-bold text-[#2D3436] mb-1">
                학생
              </h2>
              <p className="text-base text-[#636E72]">
                코드를 입력하고 퀴즈에 참여해요
              </p>
            </div>
          </Link>
        </motion.div>

        {/* 주간 말씀 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/weekly" className="block">
            <div className="game-card text-center hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#7ED321]">
              <div className="text-5xl mb-3">🕊️</div>
              <h2 className="text-2xl font-bold text-[#2D3436] mb-1">
                주간 말씀
              </h2>
              <p className="text-base text-[#636E72]">
                이번 주 말씀을 확인하고 연습해요
              </p>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* 푸터 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-sm text-[#B2BEC3]"
      >
        주일학교 성경 암기 퀴즈
      </motion.p>
    </div>
  )
}
