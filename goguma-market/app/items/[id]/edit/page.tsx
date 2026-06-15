'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  '디지털/가전', '가구/인테리어', '의류/잡화', '도서/문구',
  '스포츠/레저', '생활/식품', '유아/아동', '반려동물', '게임/취미', '기타',
]

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  // 페이지 열릴 때 기존 글 내용 불러오기
  useEffect(() => {
    async function loadItem() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: item } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single()

      if (!item) { router.push('/items'); return }

      // 본인 글이 아니면 차단
      if (item.user_id !== user.id) { router.push(`/items/${itemId}`); return }

      setTitle(item.title)
      setPrice(item.price.toLocaleString())
      setCategory(item.category)
      setDescription(item.description)
      setFetching(false)
    }
    loadItem()
  }, [itemId])

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (raw === '') { setPrice(''); return }
    setPrice(Number(raw).toLocaleString())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsedPrice = parseInt(price.replace(/,/g, ''))
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('가격을 올바르게 입력해주세요.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase
      .from('items')
      .update({ title, price: parsedPrice, category, description })
      .eq('id', itemId)

    setLoading(false)

    if (updateError) {
      setError('수정에 실패했습니다. 다시 시도해주세요.')
      return
    }

    router.push(`/items/${itemId}`)
    router.refresh()
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        불러오는 중...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/items/${itemId}`} className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
            ← 취소
          </Link>
          <h1 className="text-base font-bold text-gray-900">판매글 수정</h1>
          <button
            form="edit-form"
            type="submit"
            disabled={loading}
            className="text-sm font-bold text-orange-500 hover:text-orange-600 disabled:opacity-40 transition-colors"
          >
            {loading ? '저장 중...' : '완료'}
          </button>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-6">
        <form id="edit-form" onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              제목 <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
            <p className="text-right text-xs text-gray-300 mt-1">{title.length}/50</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                카테고리 <span className="text-orange-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all appearance-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                가격 <span className="text-orange-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">₩</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={handlePriceChange}
                  required
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              내용 <span className="text-orange-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={10}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
            <p className="text-right text-xs text-gray-300 mt-1">{description.length}/2000</p>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '저장 중...' : '수정 완료'}
          </button>
        </form>
      </main>
    </div>
  )
}
