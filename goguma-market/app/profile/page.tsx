import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 미들웨어가 막아주지만 혹시를 위해 서버에서도 체크
  if (!user) redirect('/login')

  const nickname = user.user_metadata?.nickname || '이웃'
  const joinedAt = new Date(user.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-8">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              🍠
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{nickname}</h2>
              <p className="text-sm text-gray-400">{user.email}</p>
              <p className="text-xs text-gray-300 mt-1">{joinedAt} 가입</p>
            </div>
          </div>
        </div>

        {/* 활동 현황 (나중에 실제 데이터로 연결) */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: '판매 중', value: '0', icon: '🏷️' },
            { label: '거래 완료', value: '0', icon: '✅' },
            { label: '관심 목록', value: '0', icon: '❤️' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 메뉴 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {[
            { label: '내 판매 물품', icon: '📦', href: '/sell' },
            { label: '관심 목록', icon: '❤️', href: '/likes' },
            { label: '거래 후기', icon: '⭐', href: '/reviews' },
          ].map((menu, i) => (
            <a
              key={menu.label}
              href={menu.href}
              className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{menu.icon}</span>
                <span className="text-sm font-medium text-gray-700">{menu.label}</span>
              </div>
              <span className="text-gray-300 text-sm">›</span>
            </a>
          ))}
        </div>

        <p className="text-center text-xs text-gray-300 mt-8">
          다음 단계에서 프로필 수정, 동네 인증 등을 추가할 예정이에요 🌱
        </p>
      </main>
    </div>
  )
}
