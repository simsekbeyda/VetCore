import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/services/api'
import { Send, Bot, User, ExternalLink, AlertTriangle, BookOpen, Loader } from 'lucide-react'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  found?: boolean
}

interface Source {
  name: string
  spc_url?: string
}

const EXAMPLE_QUESTIONS = [
  'Amoksisilin kedilerde hangi durumlarda kullanılır?',
  'Fenbendazol hangi türlerde etkilidir?',
  'Metronidazol köpeklerde ne için verilir?',
  'İvermektin hangi parazitlere karşı etkilidir?',
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content:
        'Merhaba! VetCore ilaç bilgi asistanıyım. Veteriner ilaçları hakkında sorularınızı yanıtlamak için buradayım.\n\n⚠️ Tanı koymaz, tedavi önermez, kesin doz tavsiyesi vermem. Yalnızca veritabanındaki ilaç bilgilerine dayanarak yanıt veririm.',
      found: true,
    },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const mutation = useMutation({
    mutationFn: (question: string) =>
      api.post('/chatbot/ask', { question }).then((r) => r.data),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          content: data.answer,
          sources: data.sources || [],
          found: data.found,
        },
      ])
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          content: 'Bir hata oluştu. Lütfen tekrar deneyin.',
          found: false,
        },
      ])
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, mutation.isPending])

  const send = () => {
    const q = input.trim()
    if (!q || mutation.isPending) return
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: q }])
    setInput('')
    mutation.mutate(q)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="bg-white border-b px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-800 text-sm">VetCore AI Asistan</h2>
          <p className="text-xs text-gray-400">Yalnızca ilaç bilgi veritabanına dayanır</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600">Aktif</span>
        </div>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-white" />
              </div>
            )}

            <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-700 text-white rounded-tr-sm'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Kaynaklar */}
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 w-full">
                  <p className="text-xs font-semibold text-blue-700 flex items-center gap-1 mb-1.5">
                    <BookOpen size={11} /> Kullanılan Kaynaklar
                  </p>
                  <div className="space-y-1">
                    {msg.sources.map((src, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-blue-800">• {src.name}</span>
                        {src.spc_url && (
                          <a href={src.spc_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-blue-500 hover:underline text-xs">
                            <ExternalLink size={10} /> SPC
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bilgi yoksa uyarı */}
              {msg.role === 'assistant' && msg.found === false && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertTriangle size={12} />
                  <span>Veritabanında yeterli bilgi bulunamadı.</span>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={14} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {/* Yazıyor göstergesi */}
        {mutation.isPending && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-1.5">
                <Loader size={14} className="animate-spin text-blue-600" />
                <span className="text-xs text-gray-400">Yanıt hazırlanıyor...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Örnek sorular */}
      {messages.length === 1 && (
        <div className="px-4 py-2 flex gap-2 flex-wrap bg-gray-50 border-t flex-shrink-0">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button key={q} onClick={() => { setInput(q); inputRef.current?.focus() }}
              className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-700 transition">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Güvenlik uyarısı */}
      <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-100 flex-shrink-0">
        <p className="text-xs text-amber-700 text-center">
          ⚠️ Bu sistem tanı koymaz, tedavi önermez. Klinik kararlar veteriner hekime aittir.
        </p>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="İlaç hakkında bir soru sorun... (Enter ile gönder)"
            rows={1}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-28 overflow-y-auto"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 112) + 'px'
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || mutation.isPending}
            className="w-10 h-10 bg-blue-700 text-white rounded-xl flex items-center justify-center hover:bg-blue-800 disabled:opacity-50 transition flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Shift+Enter ile yeni satır</p>
      </div>
    </div>
  )
}
