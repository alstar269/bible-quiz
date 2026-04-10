'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HostPage() {
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
        <h1 className="text-3xl font-extrabold text-[#2D3436]">
          👩‍🏫 선생님 메뉴
        </h1>
      </motion.div>

      <div className="flex flex-col gap-5 w-full max-w-sm">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/host/create" className="block">
            <div className="game-card text-center hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#4A90D9]">
              <div className="text-4xl mb-2">✏️</div>
              <h2 className="text-xl font-bold mb-1">퀴즈 만들기</h2>
              <p className="text-sm text-[#636E72]">
                성경 구절을 입력하여 새 퀴즈를 만들어요
              </p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/host/weekly" className="block">
            <div className="game-card text-center hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#7ED321]">
              <div className="text-4xl mb-2">📅</div>
              <h2 className="text-xl font-bold mb-1">주간 말씀 관리</h2>
              <p className="text-sm text-[#636E72]">
                이번 주 말씀을 등록하고 QR코드를 만들어요
              </p>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
