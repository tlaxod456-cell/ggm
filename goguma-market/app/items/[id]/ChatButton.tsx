'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  itemId: number
  sellerId: string
}

export default function ChatButton({ itemId, sellerId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function handleChat() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // 이미 이 물건에 대한 채팅방이 있으면 그 방으로, 없으면 새로 만들기
    const { data: existing } = await supabase
      .from('chats')
      .select('id')
      .eq('item_id', itemId)
      .eq('buyer_id', user.id)
      .single()

    if (existing) {
      router.push(`/chat/${existing.id}`)
      return
    }

    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({ item_id: itemId, buyer_id: user.id, seller_id: sellerId })
      .select('id')
      .single()

    if (error || !newChat) {
      alert('채팅방을 만들 수 없습니다. 다시 시도해주세요.')
      return
    }

    router.push(`/chat/${newChat.id}`)
  }

  return (
    <button
      onClick={handleChat}
      className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition-colors"
    >
      채팅하기
    </button>
  )
}
