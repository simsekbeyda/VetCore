import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { Plus, Trash2, Edit } from 'lucide-react'

export default function TherapeuticGroupsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const { data: groups, isLoading } = useQuery({
    queryKey: ['therapeutic-groups'],
    queryFn: () => adminService.getTherapeuticGroups(),
  })

  const createMutation = useMutation({
    mutationFn: (data: object) => adminService.createTherapeuticGroup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['therapeutic-groups'] })
      handleCloseModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminService.updateTherapeuticGroup(data.id, { name: data.name, description: data.description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['therapeutic-groups'] })
      handleCloseModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteTherapeuticGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['therapeutic-groups'] }),
  })

  const handleOpenAdd = () => {
    setEditGroup(null)
    setFormData({ name: '', description: '' })
    setModalOpen(true)
  }

  const handleOpenEdit = (group: any) => {
    setEditGroup(group)
    setFormData({ name: group.name, description: group.description || '' })
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditGroup(null)
    setFormData({ name: '', description: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    if (editGroup) {
      updateMutation.mutate({ id: editGroup.id, ...formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Terapötik Gruplar</h2>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          <Plus size={16} /> Grup Ekle
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">İsim</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Açıklama</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={3} className="text-center py-8 text-gray-400">Yükleniyor...</td></tr>
            ) : groups?.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-gray-400">Grup bulunamadı.</td></tr>
            ) : groups?.map((g: any) => (
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800 font-medium">{g.name}</td>
                <td className="px-4 py-3 text-gray-600 text-sm max-w-xs truncate">{g.description || '—'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleOpenEdit(g)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                  <button onClick={() => deleteMutation.mutate(g.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editGroup ? 'Grubu Düzenle' : 'Yeni Grup Ekle'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">İsim *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ör. Antibiyotikler"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Grup açıklaması (opsiyonel)"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 text-sm font-medium">
                  {editGroup ? 'Güncelle' : 'Ekle'}
                </button>
                <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium">
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
