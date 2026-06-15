'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: number
  chat_id: number
  sender_id: string
  content: string
  created_at: string
}

interface Props {
  chatId: number
  currentUserId: string
  initialMessages: Message[]
  otherNickname: string
  item: { id: number; title: string; price: number } | null
}

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원'
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ChatRoom({
  chatId, currentUserId, initialMessages, otherNickname, item,
}: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 새 메시지가 오면 자동으로 맨 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Supabase Realtime: 이 채팅방의 새 메시지를 실시간으로 수신
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          // 내가 보낸 메시지는 이미 낙관적 업데이트로 추가했으므로 중복 제거
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [chatId])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content || sending) return

    setInput('')
    setSending(true)

    // 낙관적 업데이트: 서버 응답 전에 화면에 먼저 표시
    const tempMsg: Message = {
      id: Date.now(), // 임시 id
      chat_id: chatId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    const { error } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, sender_id: currentUserId, content })

    setSending(false)

    if (error) {
      // 실패하면 낙관적 업데이트 롤백
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
      alert('메시지 전송에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/chat" className="text-gray-400 hover:text-gray-600 transition-colors text-sm flex-shrink-0">
            ←
          </Link>
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">
            🍠
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{otherNickname}</p>
          </div>
        </div>

        {/* 물건 정보 미니 배너 */}
        {item && (
          <Link
            href={`/items/${item.id}`}
            className="flex items-center justify-between px-4 py-2.5 bg-orange-50 border-t border-orange-100 max-w-screen-md mx-auto w-full hover:bg-orange-100 transition-colors"
          >
            <p className="text-xs text-gray-600 truncate">{item.title}</p>
            <span className="text-xs font-bold text-orange-500 flex-shrink-0 ml-3">
              {formatPrice(item.price)}
            </span>
          </Link>
        )}
      </header>

      {/* 메시지 목록 */}
      <main className="flex-1 max-w-screen-md mx-auto w-full px-4 py-4 flex flex-col gap-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10">
            첫 메시지를 보내보세요 👋
          </p>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* 상대방 아바타 */}
              {!isMine && (
                <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-xs flex-shrink-0 mb-1">
                  🍠
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? 'bg-orange-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <p className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </main>

      {/* 메시지 입력창 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100">
        <form
          onSubmit={sendMessage}
          className="max-w-screen-md mx-auto px-4 py-3 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 hover:bg-orange-600 disabled:opacity-40 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
