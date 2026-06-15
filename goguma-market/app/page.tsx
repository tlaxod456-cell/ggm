import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1">
        {/* 히어로 섹션 */}
        <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 px-4 py-16 text-center">
          <div className="max-w-lg mx-auto">
            <div className="text-6xl mb-4">🍠</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
              가깝고 따뜻한<br />
              <span className="text-orange-500">고구마마켓</span>
            </h1>
            <p className="text-gray-500 text-base mb-8">
              우리 동네 이웃과 함께하는 중고거래
            </p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-colors"
                >
                  + 물건 팔기
                </Link>
                <Link
                  href="/items"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-orange-500 font-semibold rounded-full border-2 border-orange-500 hover:bg-orange-50 transition-colors"
                >
                  둘러보기
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-colors"
                >
                  시작하기
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  로그인
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 특징 섹션 */}
        <section className="max-w-screen-md mx-auto px-4 py-14">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
            왜 고구마마켓인가요?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: '🤝', title: '안전한 거래', desc: '이웃과 직접 만나 믿을 수 있는 거래를 해보세요' },
              { icon: '🌱', title: '착한 소비', desc: '좋은 물건을 저렴하게, 지구도 지키는 중고거래' },
              { icon: '💬', title: '동네 커뮤니티', desc: '가까운 이웃과 함께 따뜻한 동네를 만들어요' },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA 섹션 (비로그인 시만 표시) */}
        {!user && (
          <section className="bg-orange-500 px-4 py-12 text-center">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-white mb-3">
                지금 바로 시작해보세요
              </h2>
              <p className="text-orange-100 text-sm mb-6">
                회원가입 후 바로 중고거래를 시작할 수 있어요
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-orange-500 font-bold rounded-full hover:bg-orange-50 transition-colors"
              >
                무료로 시작하기 →
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        © 2026 고구마마켓. 따뜻한 중고거래 플랫폼
      </footer>
    </div>
  )
}
