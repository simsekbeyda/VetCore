import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
  title: string
  queryKey: string
  fetchFn: () => Promise<any>
  createFn: (name: string) => Promise<any>
  deleteFn: (id: number) => Promise<any>
  placeholder?: string
}

export default function SimpleListPage({ title, queryKey, fetchFn, createFn, deleteFn, placeholder }: Props) {
  const qc = useQueryClient()
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: fetchFn })

  const createMutation = useMutation({
    mutationFn: () => createFn(newName.trim()),
    onSuccess: () => { setNewName(''); qc.invalidateQueries({ queryKey: [queryKey] }) },
    onError: (e: any) => setError(e.response?.data?.detail || 'Hata oluştu.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFn(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })

  const handleAdd = () => {
    setError('')
    if (!newName.trim()) { setError('Ad boş olamaz.'); return }
    createMutation.mutate()
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Ekle</label>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={placeholder || 'Ad girin...'}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleAdd} disabled={createMutation.isPending}
            className="flex items-center gap-1 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60">
            <Plus size={15} /> Ekle
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-md">
        {isLoading ? (
          <p className="text-center py-8 text-gray-400">Yükleniyor...</p>
        ) : data?.length === 0 ? (
          <p className="text-center py-8 text-gray-400">Henüz kayıt yok.</p>
        ) : (
          <ul className="divide-y">
            {data?.map((item: any) => (
              <li key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <span className="text-sm text-gray-800">{item.turkish_name || item.name}</span>
                <button
                  onClick={() => { if (confirm('Silmek istediğinize emin misiniz?')) deleteMutation.mutate(item.id) }}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
