import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 Animasyon */}
        <div className="mb-8">
          <div className="inline-block">
            <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              404
            </div>
          </div>
        </div>

        {/* Başlık */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Sayfa Bulunamadı
        </h1>

        {/* Açıklama */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Aradığınız sayfa ne yazık ki bulunamadı. URL'yi kontrol edin veya ana sayfaya dönün.
        </p>

        {/* İllüstrasyon */}
        <div className="mb-8 h-40 flex items-center justify-center">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute inset-4 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-6xl">🔍</span>
            </div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            <ArrowLeft size={18} /> Geri Dön
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Home size={18} /> Ana Sayfa
          </button>
        </div>

        {/* Yardımcı Bilgi */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Hızlı Linkler:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: 'Giriş', path: '/login' },
              { label: 'Kayıt', path: '/register' },
              { label: 'İleti Gönder', path: '/contact' },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="text-sm text-blue-600 hover:underline"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Code */}
        <div className="mt-8 text-gray-400 text-xs">
          Hata Kodu: 404
        </div>
      </div>
    </div>
  )
}
