'use client'

import Link from 'next/link'

export default function HomeButton() {
  return (
    <Link
      href="/"
      className="fixed top-4 left-4 z-50 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-2xl hover:shadow-lg hover:scale-110 transition-all active:scale-95"
      aria-label="홈으로"
    >
      🏠
    </Link>
  )
}
