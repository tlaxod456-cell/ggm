'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteButton({ itemId, images }: { itemId: number; images: string[] }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm('판매글을 삭제할까요?')) return

    // Storage에서 이미지 파일 삭제
    for (const url of images) {
      const path = url.split('/item-images/')[1]
      if (path) {
        await supabase.storage.from('item-images').remove([decodeURIComponent(path)])
      }
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)

    if (error) {
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
      return
    }

    router.push('/items')
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm font-medium text-red-400 hover:text-red-600 transition-colors"
    >
      삭제
    </button>
  )
}
