import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { AlertCircle } from 'lucide-react'

export default function MissingDataPage() {
  const { data, isLoading } = useQuery({ queryKey: ['missing-drugs'], queryFn: adminService.getMissingDrugs })

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Eksik Veri Kontrolü</h2>
      <p className="text-gray-500 text-sm mb-6">Zorunlu alanları eksik olan ilaç kayıtları aşağıda listelenmektedir.</p>

      {isLoading ? (
        <p className="text-gray-400">Yükleniyor...</p>
      ) : data?.length === 0 ? (
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <p className="text-green-700 font-medium">Tüm kayıtlar eksiksiz.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-red-50 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-red-700 text-sm font-medium">{data?.length} eksik kayıt bulundu</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">İlaç Adı</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Eksik Alanlar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.missing_fields.map((f: string) => (
                        <span key={f} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
