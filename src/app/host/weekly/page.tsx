'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { generateId } from '@/lib/quiz-engine'
import { isSupabaseConfigured, insertWeeklyVerse, fetchWeeklyVerses } from '@/lib/supabase-api'
import type { WeeklyVerse } from '@/types'
import Link from 'next/link'
import HomeButton from '@/components/common/HomeButton'

// localStorage 폴백
function saveWeeklyVerseLocal(verse: WeeklyVerse): void {
  if (typeof window === 'undefined') return
  const existing = loadWeeklyVersesLocal()
  localStorage.setItem(
    'bible-quiz-weekly-verses',
    JSON.stringify([verse, ...existing])
  )
}

function loadWeeklyVersesLocal(): WeeklyVerse[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem('bible-quiz-weekly-verses')
  if (!raw) return []
  try {
    return JSON.parse(raw) as WeeklyVerse[]
  } catch {
    return []
  }
}

export default function WeeklyManagePage() {
  const [verseRef, setVerseRef] = useState('')
  const [verseText, setVerseText] = useState('')
  const [savedVerses, setSavedVerses] = useState<WeeklyVerse[]>([])
  const [justSaved, setJustSaved] = useState<WeeklyVerse | null>(null)

  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured) {
        const verses = await fetchWeeklyVerses()
        setSavedVerses(verses)
      } else {
        setSavedVerses(loadWeeklyVersesLocal())
      }
    }
    void load()
  }, [])

  const handleSave = async () => {
    if (!verseRef.trim() || !verseText.trim()) return

    const verse: WeeklyVerse = {
      id: generateId(),
      verseRef: verseRef.trim(),
      verseText: verseText.trim(),
      weekStart: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }

    if (isSupabaseConfigured) {
      await insertWeeklyVerse(verse)
      const verses = await fetchWeeklyVerses()
      setSavedVerses(verses)
    } else {
      saveWeeklyVerseLocal(verse)
      setSavedVerses(loadWeeklyVersesLocal())
    }

    setJustSaved(verse)
    setVerseRef('')
    setVerseText('')
  }

  const weeklyUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/weekly` : ''

  return (
    <div className="flex flex-col items-center min-h-screen p-6 pt-20">
      <HomeButton />
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-extrabold text-[#2D3436]">
          📅 주간 말씀 관리
        </h1>
      </motion.div>

      <div className="w-full max-w-md space-y-6">
        {/* 입력 폼 */}
        <div className="game-card space-y-3">
          <h2 className="text-lg font-bold">이번 주 말씀 등록</h2>
          <input
            type="text"
            value={verseRef}
            onChange={(e) => setVerseRef(e.target.value)}
            placeholder="성경 위치 (예: 시편 23:1)"
            className="w-full p-4 text-base border-2 border-[#E0E0E0] rounded-2xl focus:border-[#4A90D9] focus:outline-none"
          />
          <textarea
            value={verseText}
            onChange={(e) => setVerseText(e.target.value)}
            placeholder="말씀 내용을 입력하세요"
            rows={3}
            className="w-full p-4 text-base border-2 border-[#E0E0E0] rounded-2xl focus:border-[#4A90D9] focus:outline-none resize-none"
          />
          <button
            onClick={handleSave}
            disabled={!verseRef.trim() || !verseText.trim()}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ✅ 말씀 등록
          </button>
        </div>

        {/* 방금 저장된 말씀 QR */}
        {justSaved && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="game-card flex flex-col items-center"
          >
            <h2 className="text-lg font-bold mb-3">QR코드 생성 완료!</h2>
            <QRCodeSVG
              value={weeklyUrl}
              size={180}
              bgColor="#FFFFFF"
              fgColor="#2D3436"
              level="M"
              includeMargin
            />
            <p className="text-sm text-[#636E72] mt-3">
              이 QR코드를 주보에 넣거나 화면에 띄워주세요
            </p>
          </motion.div>
        )}

        {/* 등록된 말씀 목록 */}
        {savedVerses.length > 0 && (
          <div className="game-card">
            <h2 className="text-lg font-bold mb-3">등록된 말씀</h2>
            <div className="space-y-3">
              {savedVerses.slice(0, 5).map((v) => (
                <div key={v.id} className="p-3 bg-[#F8F9FA] rounded-2xl">
                  <p className="text-sm text-[#4A90D9] font-bold">
                    {v.verseRef}
                  </p>
                  <p className="text-base">{v.verseText}</p>
                  <p className="text-xs text-[#B2BEC3] mt-1">
                    {v.weekStart}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
