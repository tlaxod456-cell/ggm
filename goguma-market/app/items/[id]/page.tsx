import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DeleteButton from './DeleteButton'
import ChatButton from './ChatButton'

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

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (!item) notFound()

  const { data: authorData } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', item.user_id)
    .single()

  const authorNickname = authorData?.nickname ?? '이웃'
  const isOwner = user?.id === item.user_id

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-screen-md mx-auto w-full">
        {/* 상단 바: 뒤로가기 + (내 글이면) 수정/삭제 */}
        <div className="px-4 pt-4 flex items-center justify-between">
          <Link href="/items" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← 목록으로
          </Link>
          {isOwner && (
            <div className="flex items-center gap-3">
              <Link
                href={`/items/${id}/edit`}
                className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors"
              >
                수정
              </Link>
              {/* 삭제는 서버 액션이 필요해서 클라이언트 컴포넌트로 분리 */}
              <DeleteButton itemId={item.id} />
            </div>
          )}
        </div>

        {/* 이미지 자리 */}
        <div className="mx-4 mt-4 bg-orange-50 rounded-2xl h-56 flex flex-col items-center justify-center text-orange-300 border border-orange-100">
          <span className="text-6xl">{categoryEmoji(item.category)}</span>
          <p className="text-xs mt-3">사진 준비 중</p>
        </div>

        <div className="px-4 py-5">
          {/* 작성자 정보 */}
          <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">
              🍠
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{authorNickname}</p>
              <p className="text-xs text-gray-400">{timeAgo(item.created_at)}</p>
            </div>
          </div>

          {/* 제목 + 가격 배지 + 상태 배지 */}
          <div className="py-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                {item.category}
              </span>
              {item.status === 'reserved' && (
                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded-full font-medium">예약중</span>
              )}
              {item.status === 'sold' && (
                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full font-medium">판매완료</span>
              )}
            </div>

            {/* 제목 + 가격 버튼 나란히 */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{item.title}</h1>
              <span className="flex-shrink-0 px-4 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-full">
                {formatPrice(item.price)}
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* 하단: 채팅 버튼 */}
          <div className="pt-5">
            {!isOwner && user && (
              <ChatButton itemId={item.id} sellerId={item.user_id} />
            )}
            {!user && (
              <Link
                href="/login"
                className="block w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl text-sm text-center hover:bg-orange-600 transition-colors"
              >
                로그인 후 채팅하기
              </Link>
            )}
            {isOwner && (
              <p className="text-center text-xs text-gray-400">내가 등록한 판매글입니다</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
