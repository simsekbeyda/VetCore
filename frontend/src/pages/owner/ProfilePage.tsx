import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { ownerService } from '@/services/ownerService'
import { notificationManager } from '@/utils/notificationManager'
import { User, Save, Bell } from 'lucide-react'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [name, setName] = useState(user?.full_name || '')
  const [saved, setSaved] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Bildirim durumunu kontrol et
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  const mutation = useMutation({
    mutationFn: () => ownerService.updateProfile({ full_name: name }),
    onSuccess: (data) => {
      setUser({ ...user!, full_name: data.full_name })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const handleEnableNotifications = async () => {
    const granted = await notificationManager.requestPermission()
    if (granted) {
      setNotificationsEnabled(true)
      setNotificationPermission('granted')
      await notificationManager.success('Bildirimler Etkinleştirildi', 'Tarayıcı bildirimleri artık açık')
    } else {
      setNotificationPermission('denied')
    }
  }

  const handleTestNotification = async () => {
    if (notificationsEnabled) {
      await notificationManager.success('Test Bildirimi', 'Bu bir test bildirimidir')
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Profilim</h1>

      <div className="space-y-6">
        {/* Profil Kartı */}
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={28} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user?.full_name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Hayvan Sahibi</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input value={user?.email} disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
            </div>

            <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
              className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-60">
              <Save size={15} /> {mutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            {saved && <p className="text-green-600 text-sm">✓ Profil güncellendi.</p>}
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Tarayıcı Bildirimleri</h2>
          </div>

          <p className="text-gray-600 text-sm mb-4">
            İlaç zamanları, veteriner randevuları ve diğer önemli olaylar hakkında bildirim alın.
          </p>

          {notificationsEnabled ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Bildirimler Etkinleştirildi
              </div>
              <button onClick={handleTestNotification}
                className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm hover:bg-green-200">
                Test Bildirimi Gönder
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                {notificationPermission === 'denied' ? 'Bildirim İzni Reddedildi' : 'Bildirimler Kapalı'}
              </div>
              {notificationPermission !== 'denied' && (
                <button onClick={handleEnableNotifications}
                  className="w-full bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
                  Bildirimleri Etkinleştir
                </button>
              )}
              {notificationPermission === 'denied' && (
                <p className="text-gray-500 text-xs">
                  Tarayıcı ayarlarından bildirimleri etkinleştirerek tekrar deneyebilirsiniz.
                </p>
              )}
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            💡 Bildirimler, ilaç zamanları ve veteriner randevuları hakkında sizi haberdar tutacaktır.
          </div>
        </div>
      </div>
    </div>
  )
}
