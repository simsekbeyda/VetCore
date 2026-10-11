import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { Search, Plus, Trash2, Edit, ExternalLink } from 'lucide-react'
import DrugFormModal from './DrugFormModal'

export default function DrugsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editDrug, setEditDrug] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-drugs', search, page],
    queryFn: () => adminService.getDrugs({ search, page, size: 20 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteDrug(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-drugs'] }),
  })

  const openAdd = () => { setEditDrug(null); setModalOpen(true) }
  const openEdit = (drug: any) => { setEditDrug(drug); setModalOpen(true) }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">İlaç Yönetimi</h2>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          <Plus size={16} /> İlaç Ekle
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="İlaç adı veya ticari isim ara..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">İlaç Adı</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Farmakolojik Sınıf</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Türler</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">SPC</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Yükleniyor...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Kayıt bulunamadı.</td></tr>
            ) : data?.items?.map((drug: any) => (
              <tr key={drug.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{drug.name}</p>
                  {drug.trade_names && <p className="text-gray-400 text-xs">{drug.trade_names}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">{drug.pharmacological_class || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {drug.species?.map((s: any) => (
                      <span key={s.id} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{s.turkish_name || s.name}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {drug.spc_url
                    ? <a href={drug.spc_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><ExternalLink size={13} /> Link</a>
                    : <span className="text-red-400 text-xs">Eksik</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(drug)} className="text-gray-400 hover:text-blue-600"><Edit size={15} /></button>
                    <button onClick={() => { if (confirm('Silmek istediğinize emin misiniz?')) deleteMutation.mutate(drug.id) }} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 text-sm text-gray-600">
            <span>Toplam: {data.total} kayıt</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Önceki</button>
              <span className="px-3 py-1">Sayfa {page}</span>
              <button disabled={page * 20 >= data.total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Sonraki</button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <DrugFormModal
          drug={editDrug}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); qc.invalidateQueries({ queryKey: ['admin-drugs'] }) }}
        />
      )}
    </div>
  )
}
