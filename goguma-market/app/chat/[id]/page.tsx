import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChatRoom from './ChatRoom'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 채팅방 + 물건 정보 가져오기
  const { data: chat } = await supabase
    .from('chats')
    .select('*, items(id, title, price)')
    .eq('id', id)
    .single()

  if (!chat) notFound()

  // 이 채팅방 참여자가 아니면 차단
  if (chat.buyer_id !== user.id && chat.seller_id !== user.id) {
    redirect('/chat')
  }

  // 기존 메시지 가져오기
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', id)
    .order('created_at', { ascending: true })

  // 상대방 닉네임
  const otherId = chat.buyer_id === user.id ? chat.seller_id : chat.buyer_id
  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', otherId)
    .single()

  return (
    <ChatRoom
      chatId={Number(id)}
      currentUserId={user.id}
      initialMessages={messages ?? []}
      otherNickname={otherProfile?.nickname ?? '이웃'}
      item={chat.items as { id: number; title: string; price: number } | null}
    />
  )
}
