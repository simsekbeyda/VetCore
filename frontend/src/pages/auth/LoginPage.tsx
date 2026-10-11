import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import VetCoreLogo from '@/components/common/VetCoreLogo'
import {
  Eye, EyeOff, LogIn, Pill, BrainCircuit, ClipboardList, ShieldCheck,
} from 'lucide-react'

const schema = z.object({
  email:    z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
})
type FormData = z.infer<typeof schema>

const features = [
  {
    icon: Pill,
    title: '3.131 Kayıtlı İlaç',
    desc:  'Türkiye\'de ruhsatlı tüm veteriner ilaçları',
    ring:  'ring-brand-400/30',
    bg:    'bg-brand-500/20',
    color: 'text-brand-300',
  },
  {
    icon: BrainCircuit,
    title: 'Gemini AI Chatbot',
    desc:  'İnternet destekli akıllı ilaç asistanı',
    ring:  'ring-amber-400/30',
    bg:    'bg-amber-500/20',
    color: 'text-amber-300',
  },
  {
    icon: ClipboardList,
    title: 'Dijital Anamnez',
    desc:  'Yapay zeka destekli hasta değerlendirmesi',
    ring:  'ring-sky-400/30',
    bg:    'bg-sky-500/20',
    color: 'text-sky-300',
  },
  {
    icon: ShieldCheck,
    title: 'Onaylı SPC Belgeleri',
    desc:  'Resmi kısa ürün bilgilerine direkt erişim',
    ring:  'ring-emerald-400/30',
    bg:    'bg-emerald-500/20',
    color: 'text-emerald-300',
  },
]

export default function LoginPage() {
  const navigate  = useNavigate()
  const setUser   = useAuthStore((s) => s.setUser)
  const [error,   setError]   = useState('')
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const tokens = await authService.login(data)
      localStorage.setItem('access_token',  tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      const user = await authService.me()
      setUser(user)
      if      (user.role === 'admin') navigate('/admin')
      else if (user.role === 'vet')   navigate('/vet')
      else                             navigate('/owner')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Giriş başarısız.')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ══ Sol panel ══ */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-warm-950 via-brand-950 to-warm-900 flex-col justify-between p-12 relative overflow-hidden">

        {/* Dekoratif halkalar */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-brand-700/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-600/8 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-12 w-64 h-64 rounded-full border border-white/[0.05] pointer-events-none" />
        <div className="absolute top-1/3 right-12 w-40 h-40 mt-12 ml-12 rounded-full border border-white/[0.05] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <VetCoreLogo size={42} light />
        </div>

        {/* Ana kopya */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-700/30 border border-brand-500/30 text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Veteriner Sağlık Platformu
          </div>
          <h2 className="text-[2.6rem] font-extrabold text-white leading-[1.15] mb-5 tracking-tight">
            Veteriner İlaç<br />Bilgi Sistemi
          </h2>
          <p className="text-warm-400 text-base leading-relaxed mb-10 max-w-sm">
            Türkiye'deki tüm ruhsatlı veteriner ilaçlarına hızlı, güvenilir ve yapay zeka destekli erişim.
          </p>

          {/* Özellik kartları */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, title, desc, ring, bg, color }) => (
              <div
                key={title}
                className={`group rounded-2xl p-4 bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] ring-1 ${ring} hover:bg-white/8 transition-all duration-200`}
              >
                <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${bg} mb-3`}>
                  <Icon size={18} className={color} strokeWidth={1.8} />
                </div>
                <div className="text-white font-semibold text-sm leading-tight mb-1">{title}</div>
                <div className="text-warm-500 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alt bilgi */}
        <p className="text-warm-600 text-xs relative z-10">
          © 2024 VetCore &nbsp;·&nbsp; Beyda Şimşek &amp; Atılım Rojda Turan
        </p>
      </div>

      {/* ══ Sağ panel: Form ══ */}
      <div className="flex-1 flex items-center justify-center bg-warm-50 px-6 py-12">
        <div className="w-full max-w-[400px]">

          {/* Mobil logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <VetCoreLogo size={38} />
          </div>

          {/* Form kartı */}
          <div className="bg-white rounded-3xl border border-warm-100 shadow-card-lg p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-warm-900 tracking-tight">Giriş Yap</h1>
              <p className="text-warm-500 text-sm mt-1.5">Hesabınıza erişmek için bilgilerinizi girin.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* E-posta */}
              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-1.5">E-posta</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="hekim@ornek.com"
                  autoComplete="email"
                  className="input"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-1.5">Şifre</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Hata */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                  <span className="text-red-700 text-sm leading-snug">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-1"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                    </svg>
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Giriş Yap
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-warm-100 text-center">
              <p className="text-sm text-warm-500">
                Hesabınız yok mu?{' '}
                <Link to="/register" className="text-brand-700 font-bold hover:underline">
                  Kayıt olun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
