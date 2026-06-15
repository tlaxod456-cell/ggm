import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { redirect } from 'next/navigation'

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default async function ChatListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 내가 참여한 채팅방 목록 + 마지막 메시지 + 상대방 정보 한 번에 가져오기
  const { data: chats } = await supabase
    .from('chats')
    .select(`
      id,
      buyer_id,
      seller_id,
      items ( id, title, category ),
      messages ( content, created_at, sender_id )
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { referencedTable: 'messages', ascending: false })

  // 상대방 닉네임을 한꺼번에 가져오기
  const otherIds = (chats ?? []).map(c =>
    c.buyer_id === user.id ? c.seller_id : c.buyer_id
  )
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nickname')
    .in('id', otherIds.length > 0 ? otherIds : ['00000000-0000-0000-0000-000000000000'])

  const nicknameMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.nickname]))

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-6">
        <h1 className="text-lg font-bold text-gray-900 mb-5">채팅</h1>

        {(!chats || chats.length === 0) ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-base font-medium text-gray-500 mb-1">아직 채팅이 없어요</p>
            <p className="text-sm text-gray-400">물건 상세 페이지에서 채팅을 시작해보세요</p>
            <Link
              href="/items"
              className="inline-block mt-6 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full text-sm hover:bg-orange-600 transition-colors"
            >
              물건 둘러보기
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {chats.map((chat) => {
              const otherId = chat.buyer_id === user.id ? chat.seller_id : chat.buyer_id
              const otherNickname = nicknameMap[otherId] ?? '이웃'
              const item = (Array.isArray(chat.items) ? chat.items[0] : chat.items) as { id: number; title: string; category: string } | null
              // 마지막 메시지: messages 배열에서 created_at 기준 최신 1개
              const msgs = (chat.messages ?? []) as { content: string; created_at: string; sender_id: string }[]
              const lastMsg = msgs.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0]

              return (
                <li key={chat.id}>
                  <Link
                    href={`/chat/${chat.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-orange-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                      🍠
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold text-gray-900">{otherNickname}</p>
                        {lastMsg && (
                          <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {timeAgo(lastMsg.created_at)}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mb-0.5">
                        {item?.title ?? '삭제된 물건'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {lastMsg ? lastMsg.content : '대화를 시작해보세요'}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
