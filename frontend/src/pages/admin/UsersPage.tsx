import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'

const ROLES = ['admin', 'vet', 'owner']

export default function UsersPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: adminService.getUsers })

  const mutation = useMutation({
    mutationFn: ({ id, role, is_active }: any) => adminService.updateUserRole(id, { role, is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Kullanıcı Yönetimi</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ad Soyad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">E-posta</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Yükleniyor...</td></tr>
            ) : data?.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{user.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={e => mutation.mutate({ id: user.id, role: e.target.value, is_active: user.is_active })}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => mutation.mutate({ id: user.id, role: user.role, is_active: !user.is_active })}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {user.is_active ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(user.created_at).toLocaleDateString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
