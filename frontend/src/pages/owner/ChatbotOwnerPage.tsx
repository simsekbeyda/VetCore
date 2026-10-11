import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/services/api'
import { Send, Bot, User, ExternalLink, AlertTriangle, BookOpen, Loader } from 'lucide-react'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  sources?: { name: string; spc_url?: string }[]
  found?: boolean
}

const EXAMPLE_QUESTIONS = [
  'Amoksisilin nedir, ne işe yarar?',
  'Kedim için antiparaziter ilaç önerir misin?',
  'Fenbendazol güvenli mi?',
]

export default function ChatbotOwnerPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content:
        'Merhaba! VetCore ilaç bilgi asistanıyım 🐾\n\nHayvanınızın ilaçları hakkında merak ettiğiniz şeyleri sorabilirsiniz.\n\n⚠️ Tanı koymaz, tedavi önermem. Yalnızca genel ilaç bilgisi veririm — her zaman veteriner hekiminize danışın.',
      found: true,
    },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const mutation = useMutation({
    mutationFn: (question: string) =>
      api.post('/chatbot/ask', { question }).then(r => r.data),
    onSuccess: data => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'assistant', content: data.answer, sources: data.sources || [], found: data.found },
      ])
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'assistant', content: 'Bir hata oluştu, lütfen tekrar deneyin.', found: false },
      ])
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, mutation.isPending])

  const send = () => {
    const q = input.trim()
    if (!q || mutation.isPending) return
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: q }])
    setInput('')
    mutation.mutate(q)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="bg-white border-b px-5 py-3 flex items-center gap-3 flex-shrink-0 rounded-t-xl">
        <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-800 text-sm">İlaç Bilgi Asistanı</h2>
          <p className="text-xs text-gray-400">VetCore veritabanına dayalı yanıtlar</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600">Aktif</span>
        </div>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[80%] space-y-2 flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-tr-sm'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 w-full">
                  <p className="text-xs font-semibold text-green-700 flex items-center gap-1 mb-1">
                    <BookOpen size={11} /> Kaynaklar
                  </p>
                  {msg.sources.map((src, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-green-800">• {src.name}</span>
                      {src.spc_url && (
                        <a href={src.spc_url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-green-500 hover:underline text-xs">
                          <ExternalLink size={10} /> Prospektüs
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {msg.role === 'assistant' && msg.found === false && (
                <p className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle size={12} /> Veritabanında yeterli bilgi bulunamadı.
                </p>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={14} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {mutation.isPending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
              <Loader size={14} className="animate-spin text-green-500" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Örnek sorular */}
      {messages.length === 1 && (
        <div className="px-4 py-2 flex gap-2 flex-wrap bg-gray-50 border-t flex-shrink-0">
          {EXAMPLE_QUESTIONS.map(q => (
            <button key={q} onClick={() => setInput(q)}
              className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full hover:border-green-400 hover:text-green-700 transition">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Uyarı */}
      <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-100 flex-shrink-0">
        <p className="text-xs text-amber-700 text-center">
          ⚠️ Bu sistem tanı koymaz, tedavi önermez. Sağlık kararları için veteriner hekiminize başvurun.
        </p>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Soru sorun... (Enter ile gönder)"
            rows={1}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 max-h-28 overflow-y-auto"
            onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 112) + 'px' }} />
          <button onClick={send} disabled={!input.trim() || mutation.isPending}
            className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 disabled:opacity-50 transition flex-shrink-0">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
