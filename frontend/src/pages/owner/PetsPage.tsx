import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ownerService } from '@/services/ownerService'
import { Plus, Pencil, Trash2, ChevronRight, PawPrint } from 'lucide-react'
import PetFormModal from './PetFormModal'

const speciesEmoji: Record<string, string> = { Kedi: '🐱', Köpek: '🐶', Diğer: '🐾' }

export default function PetsPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [editPet, setEditPet] = useState<any>(null)

  const { data: pets, isLoading } = useQuery({ queryKey: ['owner-pets'], queryFn: ownerService.getPets })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ownerService.deletePet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['owner-pets'] }),
  })

  const openAdd = () => { setEditPet(null); setModalOpen(true) }
  const openEdit = (pet: any) => { setEditPet(pet); setModalOpen(true) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Hayvanlarım</h1>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          <Plus size={15} /> Hayvan Ekle
        </button>
      </div>

      {isLoading ? <p className="text-gray-400">Yükleniyor...</p>
        : pets?.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <PawPrint size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 mb-2">Henüz hayvan eklenmedi.</p>
            <button onClick={openAdd} className="text-blue-600 text-sm hover:underline">Şimdi ekle →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets?.map((pet: any) => (
              <div key={pet.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer"
                onClick={() => navigate(`/owner/pets/${pet.id}`)}>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{speciesEmoji[pet.species] || '🐾'}</span>
                      <div>
                        <h3 className="font-bold text-gray-800">{pet.name}</h3>
                        <p className="text-sm text-gray-500">
                          {pet.species}{pet.breed ? ` — ${pet.breed}` : ''}
                          {pet.gender ? ` · ${pet.gender}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={e => { e.stopPropagation(); openEdit(pet) }}
                        className="text-gray-400 hover:text-blue-600 p-1"><Pencil size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); if (confirm(`${pet.name} silinsin mi?`)) deleteMutation.mutate(pet.id) }}
                        className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    {pet.birth_date && <span>📅 {pet.birth_date}</span>}
                    {pet.weight && <span>⚖️ {pet.weight} kg</span>}
                    {pet.color && <span>🎨 {pet.color}</span>}
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex items-center justify-between text-xs text-gray-400">
                  <span>Ziyaret · İlaç kayıtları · Takvim</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}

      {modalOpen && (
        <PetFormModal pet={editPet} onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); qc.invalidateQueries({ queryKey: ['owner-pets'] }) }} />
      )}
    </div>
  )
}
