'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// 카테고리 목록
const CATEGORIES = [
  '디지털/가전',
  '가구/인테리어',
  '의류/잡화',
  '도서/문구',
  '스포츠/레저',
  '생활/식품',
  '유아/아동',
  '반려동물',
  '게임/취미',
  '기타',
]

export default function SellPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // 로그인 여부 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const parsedPrice = parseInt(price.replace(/,/g, ''))
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('가격을 올바르게 입력해주세요.')
      return
    }

    setLoading(true)

    // Supabase items 테이블에 판매글 저장
    const { error: insertError } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        title,
        price: parsedPrice,
        category,
        description,
      })

    setLoading(false)

    if (insertError) {
      setError('판매글 등록에 실패했습니다. 다시 시도해주세요.')
      return
    }

    // 등록 성공 → 홈으로 이동
    router.push('/')
    router.refresh()
  }

  // 가격 입력 시 세 자리마다 쉼표 표시
  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (raw === '') { setPrice(''); return }
    setPrice(Number(raw).toLocaleString())
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
            ← 취소
          </Link>
          <h1 className="text-base font-bold text-gray-900">판매글 작성</h1>
          <button
            form="sell-form"
            type="submit"
            disabled={loading}
            className="text-sm font-bold text-orange-500 hover:text-orange-600 disabled:opacity-40 transition-colors"
          >
            {loading ? '등록 중...' : '완료'}
          </button>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-6">
        <form id="sell-form" onSubmit={handleSubmit} className="space-y-5">

          {/* 제목 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              제목 <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="판매할 물건의 제목을 입력하세요"
              required
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
            <p className="text-right text-xs text-gray-300 mt-1">{title.length}/50</p>
          </div>

          {/* 카테고리 + 가격 (나란히) */}
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
                <option value="">선택하세요</option>
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
                  placeholder="0"
                  required
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              내용 <span className="text-orange-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={'물건의 상태, 구매 시기, 사용감 등을 자세히 적어주세요.\n\n예) 6개월 전 구매했고 거의 사용하지 않았습니다. 흠집 없이 깨끗해요.'}
              required
              rows={10}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
            <p className="text-right text-xs text-gray-300 mt-1">{description.length}/2000</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          {/* 하단 등록 버튼 (모바일용) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '등록 중...' : '판매글 올리기'}
          </button>
        </form>
      </main>
    </div>
  )
}
