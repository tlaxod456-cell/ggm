'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 이메일 확인 비활성화 상태: signUp 후 바로 세션이 생성된다
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
      },
    })

    setLoading(false)

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('이미 가입된 이메일입니다.')
      } else if (signUpError.message.includes('Password')) {
        setError('비밀번호는 6자 이상이어야 합니다.')
      } else {
        setError(signUpError.message)
      }
      return
    }

    // 가입 즉시 홈으로 이동
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
          <h1 className="text-xl font-bold text-gray-900 mt-2">고구마마켓 가입하기</h1>
          <p className="text-sm text-gray-400 mt-1">우리 동네 중고거래를 시작해보세요</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* 닉네임 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="이웃에게 보일 이름"
              required
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
          </div>

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
              placeholder="6자 이상 입력"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* 가입 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl text-sm hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-orange-500 font-semibold hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
