import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원'
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

function categoryEmoji(category: string) {
  const map: Record<string, string> = {
    '디지털/가전': '📱', '가구/인테리어': '🪑', '의류/잡화': '👕',
    '도서/문구': '📚', '스포츠/레저': '⚽', '생활/식품': '🛒',
    '유아/아동': '🧸', '반려동물': '🐾', '게임/취미': '🎮', '기타': '📦',
  }
  return map[category] ?? '📦'
}

const STATUS_LABEL: Record<string, string> = {
  sale: '판매중',
  reserved: '예약중',
  sold: '판매완료',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const nickname = user.user_metadata?.nickname || '이웃'
  const joinedAt = new Date(user.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // 내 판매글 전체 조회
  const { data: myItems } = await supabase
    .from('items')
    .select('id, title, price, category, status, created_at, images')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = myItems ?? []
  const countSale = items.filter(i => i.status === 'sale').length
  const countSold = items.filter(i => i.status === 'sold').length

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-8">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
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

        {/* 활동 현황 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl mb-1">🏷️</div>
            <div className="text-xl font-bold text-gray-900">{countSale}</div>
            <div className="text-xs text-gray-400">판매 중</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-xl font-bold text-gray-900">{countSold}</div>
            <div className="text-xs text-gray-400">거래 완료</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl mb-1">📦</div>
            <div className="text-xl font-bold text-gray-900">{items.length}</div>
            <div className="text-xs text-gray-400">전체 판매글</div>
          </div>
        </div>

        {/* 내 판매 물품 목록 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700">내 판매 물품</h3>
            <Link href="/sell" className="text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors">
              + 새 판매글
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-12 text-center text-gray-400">
              <div className="text-4xl mb-3">🍠</div>
              <p className="text-sm">아직 등록한 판매글이 없어요</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {items.map((item) => {
                const thumbnail = item.images?.[0]
                return (
                  <li key={item.id}>
                    <Link
                      href={`/items/${item.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-orange-50 transition-colors"
                    >
                      {/* 썸네일 */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-orange-100 flex items-center justify-center text-xl">
                        {thumbnail ? (
                          <Image
                            src={thumbnail}
                            alt={item.title}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          categoryEmoji(item.category)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(item.created_at)}</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(item.price)}</p>
                      </div>

                      {/* 판매 상태 배지 */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        item.status === 'sale' ? 'bg-orange-100 text-orange-600' :
                        item.status === 'reserved' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
