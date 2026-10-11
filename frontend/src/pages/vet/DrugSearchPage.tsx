import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { vetService } from '@/services/vetService'
import { Search, Heart, ChevronRight, Filter, X } from 'lucide-react'
import AdvancedDoseCalculator from './AdvancedDoseCalculator'

export default function DrugSearchPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    species_id: 0, indication_id: 0, therapeutic_group: '', ingredient_id: 0, trade_names_only: false,
  })
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card')

  const { data: species } = useQuery({ queryKey: ['vet-species'], queryFn: vetService.getSpecies })
  const { data: indications } = useQuery({ queryKey: ['vet-indications'], queryFn: vetService.getIndications })
  const { data: therapGroups } = useQuery({ queryKey: ['vet-thgroups'], queryFn: vetService.getTherapeuticGroups })
  const { data: favData } = useQuery({ queryKey: ['vet-favorites'], queryFn: vetService.getFavorites })

  const favIds = new Set<number>((favData || []).map((f: any) => f.id))

  const { data, isLoading } = useQuery({
    queryKey: ['vet-drugs', search, filters, page],
    queryFn: () => vetService.searchDrugs({ search, ...filters, page, size: 24 }),
    placeholderData: (prev) => prev,
  })

  const addFav = useMutation({
    mutationFn: (id: number) => vetService.addFavorite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vet-favorites'] }),
  })
  const remFav = useMutation({
    mutationFn: (id: number) => vetService.removeFavorite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vet-favorites'] }),
  })

  const toggleFav = (id: number) => favIds.has(id) ? remFav.mutate(id) : addFav.mutate(id)

  const setFilter = (key: string, value: any) => {
    setFilters(f => ({ ...f, [key]: value }))
    setPage(1)
  }

  const hasFilters = filters.species_id || filters.indication_id || filters.therapeutic_group
  const clearFilters = () => { setFilters({ species_id: 0, indication_id: 0, therapeutic_group: '', ingredient_id: 0, trade_names_only: false }); setPage(1) }

  return (
    <div>
      {/* Arama Çubuğu */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <h1 className="text-lg font-bold text-gray-800 mb-3">İlaç Arama</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="İlaç adı, ticari isim veya etken madde..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition ${showFilters || hasFilters ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            <Filter size={15} /> Filtrele {hasFilters ? '●' : ''}
          </button>
          <div className="flex border border-gray-300 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('card')} className={`px-3 py-2 text-xs ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Kart</button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-xs ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Liste</button>
          </div>
        </div>

        {/* Filtre Paneli */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hayvan Türü</label>
              <select value={filters.species_id} onChange={e => setFilter('species_id', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={0}>Tüm Türler</option>
                {species?.map((s: any) => <option key={s.id} value={s.id}>{s.turkish_name || s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Endikasyon</label>
              <select value={filters.indication_id} onChange={e => setFilter('indication_id', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={0}>Tüm Endikasyonlar</option>
                {indications?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Terapötik Grup</label>
              <select value={filters.therapeutic_group} onChange={e => setFilter('therapeutic_group', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tüm Gruplar</option>
                {therapGroups?.map((g: string) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 md:col-span-1">
              <input
                type="checkbox"
                id="trade-names-only"
                checked={filters.trade_names_only}
                onChange={e => setFilter('trade_names_only', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="trade-names-only" className="text-xs font-medium text-gray-600 cursor-pointer">
                Ticari isim araması
              </label>
            </div>
            {(hasFilters || filters.trade_names_only) && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-red-500 text-xs hover:underline">
                <X size={12} /> Filtreleri temizle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sonuç Sayısı */}
      {data && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">
            {data.total} sonuç bulundu
            {search && <span className="font-medium text-gray-700"> — "{search}"</span>}
          </p>
        </div>
      )}

      <AdvancedDoseCalculator standalone={true} />
      {/* Uyarı Bandı */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-amber-800 text-xs">
        ⚠️ Bu sistem yalnızca bilgi amaçlıdır. Klinik karar ve tedavi sorumluluğu veteriner hekime aittir.
      </div>

      {/* Sonuçlar */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Aranıyor...</div>
      ) : data?.items?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Sonuç bulunamadı.</div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.items?.map((drug: any) => (
            <DrugCard key={drug.id} drug={drug} isFav={favIds.has(drug.id)}
              onFav={() => toggleFav(drug.id)} onClick={() => navigate(`/vet/drugs/${drug.id}`)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">İlaç Adı</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Terapötik Grup</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Türler</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.items?.map((drug: any) => (
                <tr key={drug.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/vet/drugs/${drug.id}`)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{drug.turkish_name ? `${drug.turkish_name} (${drug.name})` : drug.name}</p>
                    {drug.trade_names && <p className="text-xs text-gray-400">{drug.trade_names}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{drug.pharmacological_class || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {drug.species?.slice(0, 3).map((s: string) => (
                        <span key={s} className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">{s}</span>
                      ))}
                      {drug.species?.length > 3 && <span className="text-gray-400 text-xs">+{drug.species.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={e => { e.stopPropagation(); toggleFav(drug.id) }}
                      className={`${favIds.has(drug.id) ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}>
                      <Heart size={16} fill={favIds.has(drug.id) ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sayfalama */}
      {data && data.total > 24 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">← Önceki</button>
          <span className="text-sm text-gray-500">Sayfa {page} / {Math.ceil(data.total / 24)}</span>
          <button disabled={page * 24 >= data.total} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Sonraki →</button>
        </div>
      )}
    </div>
  )
}

function DrugCard({ drug, isFav, onFav, onClick }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
      onClick={onClick}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">{drug.turkish_name ? `${drug.turkish_name} (${drug.name})` : drug.name}</h3>
            {drug.trade_names && <p className="text-xs text-gray-400 mt-0.5 truncate">{drug.trade_names}</p>}
          </div>
          <button onClick={e => { e.stopPropagation(); onFav() }}
            className={`ml-2 flex-shrink-0 ${isFav ? 'text-red-500' : 'text-gray-300 hover:text-red-400'} transition`}>
            <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>

        {drug.pharmacological_class && (
          <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full mb-2">
            {drug.pharmacological_class}
          </span>
        )}

        {drug.ingredients?.length > 0 && (
          <p className="text-xs text-gray-500 mb-2">
            <span className="font-medium">Etken:</span> {drug.ingredients.slice(0, 2).join(', ')}
            {drug.ingredients.length > 2 && ` +${drug.ingredients.length - 2}`}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mt-2">
          {drug.species?.slice(0, 4).map((s: string) => (
            <span key={s} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-100">{s}</span>
          ))}
          {drug.species?.length > 4 && (
            <span className="text-gray-400 text-xs">+{drug.species.length - 4}</span>
          )}
        </div>
      </div>
      <div className="px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex items-center justify-between">
        <span className="text-xs text-gray-400">{drug.spc_url ? '📄 SPC mevcut' : 'SPC yok'}</span>
        <ChevronRight size={14} className="text-gray-400" />
      </div>
    </div>
  )
}
