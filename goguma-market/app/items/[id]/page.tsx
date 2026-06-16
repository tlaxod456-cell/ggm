import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import DeleteButton from './DeleteButton'
import ChatButton from './ChatButton'
import ReactionButtons from './ReactionButtons'

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

  const [{ data: authorData }, { data: reactions }] = await Promise.all([
    supabase.from('profiles').select('nickname').eq('id', item.user_id).single(),
    supabase.from('reactions').select('user_id, type').eq('item_id', id),
  ])

  const authorNickname = authorData?.nickname ?? '이웃'
  const isOwner = user?.id === item.user_id
  const images: string[] = item.images ?? []

  const likes = reactions?.filter(r => r.type === 'like').length ?? 0
  const dislikes = reactions?.filter(r => r.type === 'dislike').length ?? 0
  const myReaction = reactions?.find(r => r.user_id === user?.id)?.type ?? null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-screen-md mx-auto w-full">
        {/* 상단 바 */}
        <div className="px-4 pt-4 flex items-center justify-between">
          <Link href="/items" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← 목록으로
          </Link>
          {isOwner && (
            <div className="flex items-center gap-3">
              <Link href={`/items/${id}/edit`} className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors">
                수정
              </Link>
              <DeleteButton itemId={item.id} images={images} />
            </div>
          )}
        </div>

        {/* 이미지 영역 */}
        {images.length > 0 ? (
          <div className="mx-4 mt-4">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image src={images[0]} alt={item.title} fill className="object-cover" priority />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-2">
                {images.slice(1).map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={url} alt={`사진 ${i + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mx-4 mt-4 bg-orange-50 rounded-2xl h-56 flex flex-col items-center justify-center text-orange-300 border border-orange-100">
            <span className="text-6xl">{categoryEmoji(item.category)}</span>
            <p className="text-xs mt-3">사진이 없는 물건이에요</p>
          </div>
        )}

        <div className="px-4 py-5">
          {/* 작성자 정보 */}
          <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">🍠</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{authorNickname}</p>
              <p className="text-xs text-gray-400">{timeAgo(item.created_at)}</p>
            </div>
          </div>

          {/* 제목 + 가격 + 상태 */}
          <div className="py-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{item.category}</span>
              {item.status === 'reserved' && (
                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded-full font-medium">예약중</span>
              )}
              {item.status === 'sold' && (
                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full font-medium">판매완료</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{item.title}</h1>
              <span className="flex-shrink-0 px-4 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-full">
                {formatPrice(item.price)}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* 좋아요 / 싫어요 */}
          <div className="py-5 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">이 물건이 마음에 드나요?</p>
            <ReactionButtons
              itemId={item.id}
              userId={user?.id ?? null}
              initialLikes={likes}
              initialDislikes={dislikes}
              initialMyReaction={myReaction as 'like' | 'dislike' | null}
            />
          </div>

          {/* 하단: 채팅 버튼 */}
          <div className="pt-5">
            {!isOwner && user && <ChatButton itemId={item.id} sellerId={item.user_id} />}
            {!user && (
              <Link
                href="/login"
                className="block w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl text-sm text-center hover:bg-orange-600 transition-colors"
              >
                로그인 후 채팅하기
              </Link>
            )}
            {isOwner && <p className="text-center text-xs text-gray-400">내가 등록한 판매글입니다</p>}
          </div>
        </div>
      </main>
    </div>
  )
}
