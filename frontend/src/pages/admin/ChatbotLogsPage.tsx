import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'

export default function ChatbotLogsPage() {
  const [page, setPage] = useState(1)
  const [userId, setUserId] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['chatbot-logs', page, userId],
    queryFn: () => adminService.getChatbotLogs({ page, size: 50, user_id: userId }),
  })

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Chatbot Logları</h2>

      <div className="flex gap-3 mb-4">
        <input
          type="number"
          value={userId}
          onChange={e => { setUserId(parseInt(e.target.value) || 0); setPage(1) }}
          placeholder="Kullanıcı ID (boş = hepsi)"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tarih</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kullanıcı</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Soru</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cevap</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kaynaklar</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Yükleniyor...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Kayıt bulunamadı.</td></tr>
            ) : data?.items?.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('tr-TR')}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{log.user_email || '—'}</td>
                <td className="px-4 py-3 text-gray-700 text-xs max-w-xs truncate">{log.question || '—'}</td>
                <td className="px-4 py-3 text-gray-700 text-xs max-w-xs truncate">{log.answer || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{log.sources ? 'Var' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Toplam: {data?.total || 0} kayıt | Sayfa: {page} / {Math.ceil((data?.total || 0) / 50)}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
          >
            Önceki
          </button>
          <button
            disabled={page >= Math.ceil((data?.total || 0) / 50)}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  )
}
