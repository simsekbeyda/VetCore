import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'

const ACTIONS = ['', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']

export default function AuditLogPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, action],
    queryFn: () => adminService.getAuditLogs({ page, size: 50, action }),
  })

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Audit Log</h2>

      <div className="flex gap-3 mb-4">
        <select value={action} onChange={e => { setAction(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          {ACTIONS.map(a => <option key={a} value={a}>{a || 'Tüm İşlemler'}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tarih</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kullanıcı</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">İşlem</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tablo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Yükleniyor...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Kayıt bulunamadı.</td></tr>
            ) : data?.items?.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('tr-TR')}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{log.user_email || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                    log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                    log.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{log.action}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{log.entity_type || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{log.entity_id || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{log.ip_address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.total > 50 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm text-gray-600">
            <span>Toplam: {data.total}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Önceki</button>
              <span className="px-3 py-1">Sayfa {page}</span>
              <button disabled={page * 50 >= data.total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Sonraki</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
