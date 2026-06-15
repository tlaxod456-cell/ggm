import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

// 가격을 "500,000원" 형태로 바꿔주는 함수
function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원'
}

// 작성 시간을 "3분 전", "2일 전" 형태로 바꿔주는 함수
function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default async function ItemsPage() {
  const supabase = await createClient()

  // 로그인 사용자 정보 (네비게이션 바에 사용)
  const { data: { user } } = await supabase.auth.getUser()

  // DB에서 판매글 목록 가져오기 (최신순)
  const { data: items, error } = await supabase
    .from('items')
    .select('id, title, price, category, status, created_at')
    .eq('status', 'sale')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-bold text-gray-900">판매 중인 물건</h1>
          {user && (
            <Link
              href="/sell"
              className="text-sm font-semibold px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
            >
              + 판매하기
            </Link>
          )}
        </div>

        {/* 에러 또는 빈 상태 */}
        {(error || !items || items.length === 0) ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🍠</div>
            <p className="text-base font-medium text-gray-500 mb-1">아직 판매 중인 물건이 없어요</p>
            <p className="text-sm">첫 번째로 물건을 올려보세요!</p>
            {user && (
              <Link
                href="/sell"
                className="inline-block mt-6 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full text-sm hover:bg-orange-600 transition-colors"
              >
                판매글 올리기
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/items/${item.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-orange-50 transition-colors"
                >
                  {/* 카테고리 아이콘 자리 (이미지 없는 버전) */}
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {categoryEmoji(item.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.category} · {timeAgo(item.created_at)}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(item.price)}</p>
                  </div>

                  <span className="text-gray-300 flex-shrink-0">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

// 카테고리별 이모지
function categoryEmoji(category: string) {
  const map: Record<string, string> = {
    '디지털/가전': '📱',
    '가구/인테리어': '🪑',
    '의류/잡화': '👕',
    '도서/문구': '📚',
    '스포츠/레저': '⚽',
    '생활/식품': '🛒',
    '유아/아동': '🧸',
    '반려동물': '🐾',
    '게임/취미': '🎮',
    '기타': '📦',
  }
  return map[category] ?? '📦'
}
