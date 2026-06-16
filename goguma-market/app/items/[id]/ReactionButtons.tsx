'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ReactionType = 'like' | 'dislike'

interface Props {
  itemId: number
  userId: string | null
  initialLikes: number
  initialDislikes: number
  initialMyReaction: ReactionType | null
}

export default function ReactionButtons({
  itemId,
  userId,
  initialLikes,
  initialDislikes,
  initialMyReaction,
}: Props) {
  const supabase = createClient()
  const router = useRouter()

  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [myReaction, setMyReaction] = useState<ReactionType | null>(initialMyReaction)
  const [loading, setLoading] = useState(false)

  async function handleReaction(type: ReactionType) {
    if (!userId) { router.push('/login'); return }
    if (loading) return
    setLoading(true)

    // 같은 버튼 다시 누르면 → 취소
    if (myReaction === type) {
      await supabase.from('reactions').delete().eq('item_id', itemId).eq('user_id', userId)
      setMyReaction(null)
      if (type === 'like') setLikes(v => v - 1)
      else setDislikes(v => v - 1)
    }
    // 반대 버튼 누르면 → 타입 전환
    else if (myReaction !== null) {
      await supabase.from('reactions').update({ type }).eq('item_id', itemId).eq('user_id', userId)
      setMyReaction(type)
      if (type === 'like') { setLikes(v => v + 1); setDislikes(v => v - 1) }
      else { setDislikes(v => v + 1); setLikes(v => v - 1) }
    }
    // 처음 누르는 경우 → 추가
    else {
      await supabase.from('reactions').insert({ item_id: itemId, user_id: userId, type })
      setMyReaction(type)
      if (type === 'like') setLikes(v => v + 1)
      else setDislikes(v => v + 1)
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleReaction('like')}
        disabled={loading}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all disabled:opacity-50 ${
          myReaction === 'like'
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500'
        }`}
      >
        <span>👍</span>
        <span>{likes}</span>
      </button>

      <button
        onClick={() => handleReaction('dislike')}
        disabled={loading}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all disabled:opacity-50 ${
          myReaction === 'dislike'
            ? 'bg-gray-700 text-white border-gray-700'
            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
        }`}
      >
        <span>👎</span>
        <span>{dislikes}</span>
      </button>
    </div>
  )
}
