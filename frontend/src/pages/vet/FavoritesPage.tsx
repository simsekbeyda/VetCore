import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { vetService } from '@/services/vetService'
import { Heart, ChevronRight } from 'lucide-react'

export default function FavoritesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['vet-favorites'], queryFn: vetService.getFavorites })

  const remFav = useMutation({
    mutationFn: (id: number) => vetService.removeFavorite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vet-favorites'] }),
  })

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-5">Favorilerim</h1>

      {isLoading ? (
        <p className="text-gray-400">Yükleniyor...</p>
      ) : data?.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center shadow-sm">
          <Heart size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">Henüz favoriye eklenen ilaç yok.</p>
          <button onClick={() => navigate('/vet')} className="mt-4 text-blue-600 text-sm hover:underline">İlaç aramaya git →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((drug: any) => (
            <div key={drug.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="p-4 cursor-pointer" onClick={() => navigate(`/vet/drugs/${drug.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{drug.name}</h3>
                    {drug.pharmacological_class && (
                      <span className="text-xs text-blue-600">{drug.pharmacological_class}</span>
                    )}
                  </div>
                  <button onClick={e => { e.stopPropagation(); remFav.mutate(drug.id) }}
                    className="text-red-400 hover:text-red-600">
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {drug.species?.slice(0, 4).map((s: string) => (
                    <span key={s} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-2 border-t bg-gray-50 rounded-b-xl flex justify-end">
                <ChevronRight size={14} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
