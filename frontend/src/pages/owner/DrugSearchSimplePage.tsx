import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ownerService } from '@/services/ownerService'
import { Search, ExternalLink } from 'lucide-react'

export default function DrugSearchSimplePage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['owner-drugs', search, page],
    queryFn: () => ownerService.listDrugs({ search, page, size: 30 }),
    placeholderData: (prev) => prev,
  })

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-5">İlaç Ara</h1>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => handleSearch(e.target.value)}
          placeholder="İlaç adını yazın..."
          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-amber-800 text-xs">
        ⚠️ Bu bilgiler yalnızca genel bilgi amaçlıdır. İlaç kullanımı için veteriner hekiminize danışın.
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 py-10">Yükleniyor...</p>
      ) : data?.items?.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Sonuç bulunamadı.</p>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">{data?.total} ilaç listeleniyor</p>
          <div className="space-y-2">
            {data?.items?.map((drug: any) => (
              <div key={drug.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-blue-200 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">💊 {drug.name}</h3>
                    {drug.pharmacological_class && (
                      <span className="text-xs text-blue-600">{drug.pharmacological_class}</span>
                    )}
                    {drug.species?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {drug.species.slice(0, 5).map((s: string) => (
                          <span key={s} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        {drug.species.length > 5 && <span className="text-gray-400 text-xs">+{drug.species.length - 5}</span>}
                      </div>
                    )}
                  </div>
                  {drug.spc_url && (
                    <a href={drug.spc_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-blue-500 text-xs hover:underline flex-shrink-0 ml-3">
                      <ExternalLink size={12} /> Prospektüs
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {data && data.total > 30 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">← Önceki</button>
              <span className="text-sm text-gray-500">Sayfa {page} / {Math.ceil(data.total / 30)}</span>
              <button disabled={page * 30 >= data.total} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Sonraki →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
