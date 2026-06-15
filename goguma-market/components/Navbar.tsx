'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface NavbarProps {
  user: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 font-bold text-orange-500 text-lg">
          <span className="text-2xl">🍠</span>
          <span>고구마마켓</span>
        </Link>

        {/* 우측 메뉴 */}
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/sell"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
              >
                <span>+</span> 판매하기
              </Link>
              <Link
                href="/chat"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
              >
                채팅
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
              >
                프로필
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
