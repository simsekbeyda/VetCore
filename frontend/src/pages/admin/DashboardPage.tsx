import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { Pill, FlaskConical, Cat, Database, Users, AlertCircle, BookOpen } from 'lucide-react'

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  </div>
)

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: adminService.getDashboard })

  if (isLoading) return <div className="p-8 text-gray-400">Yükleniyor...</div>

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Toplam İlaç" value={data?.total_drugs} icon={Pill} color="bg-blue-600" />
        <StatCard label="Etken Madde" value={data?.total_ingredients} icon={FlaskConical} color="bg-indigo-600" />
        <StatCard label="Hayvan Türü" value={data?.total_species} icon={Cat} color="bg-green-600" />
        <StatCard label="Kaynak / SPC" value={data?.total_sources} icon={Database} color="bg-purple-600" />
        <StatCard label="Kullanıcılar" value={data?.total_users} icon={Users} color="bg-orange-500" />
        <StatCard label="SPC Eksik" value={data?.missing_spc} icon={AlertCircle} color="bg-red-500" />
        <StatCard label="Endikasyon Eksik" value={data?.missing_indications} icon={BookOpen} color="bg-yellow-500" />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3">Hızlı Erişim</h3>
        <p className="text-gray-400 text-sm">Sol menüden istediğiniz bölüme geçebilirsiniz.</p>
      </div>
    </div>
  )
}
