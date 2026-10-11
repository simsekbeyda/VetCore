import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { Plus, Trash2, ExternalLink } from 'lucide-react'

export default function SourcesPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', url: '', document_type: '' })
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['sources'], queryFn: adminService.getSources })

  const createMutation = useMutation({
    mutationFn: () => adminService.createSource(form),
    onSuccess: () => { setForm({ name: '', url: '', document_type: '' }); qc.invalidateQueries({ queryKey: ['sources'] }) },
    onError: (e: any) => setError(e.response?.data?.detail || 'Hata oluştu.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteSource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sources'] }),
  })

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Kaynak / SPC Yönetimi</h2>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 max-w-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Yeni Kaynak Ekle</h3>
        <div className="space-y-3">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Kaynak adı *" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            placeholder="URL (opsiyonel)" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Doküman Tipi (opsiyonel)</option>
            <option value="SPC">SPC</option>
            <option value="prospektüs">Prospektüs</option>
            <option value="veri tabanı">Veri Tabanı</option>
            <option value="diğer">Diğer</option>
          </select>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button onClick={() => { setError(''); if (!form.name.trim()) { setError('Ad zorunludur.'); return } createMutation.mutate() }}
            disabled={createMutation.isPending}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60">
            <Plus size={15} /> Ekle
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-2xl">
        {isLoading ? <p className="text-center py-8 text-gray-400">Yükleniyor...</p> :
          data?.length === 0 ? <p className="text-center py-8 text-gray-400">Kayıt yok.</p> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tip</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">URL</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{s.name}</td>
                    <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s.document_type || '—'}</span></td>
                    <td className="px-4 py-3">
                      {s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs"><ExternalLink size={12} /> Link</a> : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { if (confirm('Silmek istediğinize emin misiniz?')) deleteMutation.mutate(s.id) }} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  )
}
