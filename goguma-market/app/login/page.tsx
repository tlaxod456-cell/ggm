'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Supabase Auth로 이메일/비밀번호 로그인
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (loginError) {
      if (loginError.message.includes('Invalid login')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else if (loginError.message.includes('Email not confirmed')) {
        setError('이메일 인증이 필요합니다. 받은 편지함을 확인해주세요.')
      } else {
        setError(loginError.message)
      }
      return
    }

    // 로그인 성공 시 홈으로 이동 (router.refresh로 서버 컴포넌트 갱신)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-sm border border-gray-100">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-4xl">🍠</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">다시 만나서 반가워요!</h1>
          <p className="text-sm text-gray-400 mt-1">고구마마켓에 로그인하세요</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl text-sm hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="text-orange-500 font-semibold hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
