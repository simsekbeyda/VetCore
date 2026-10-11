import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/authService'
import VetCoreLogo from '@/components/common/VetCoreLogo'
import { UserPlus } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalı'),
  email:     z.string().email('Geçerli bir e-posta girin'),
  password:  z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  role:      z.enum(['vet', 'owner']),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'vet' } })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await authService.register(data)
      navigate('/login', { state: { registered: true } })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Kayıt başarısız.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-6 py-12">
      <div className="w-full max-w-[400px]">

        <div className="flex justify-center mb-8">
          <VetCoreLogo size={38} />
        </div>

        <div className="bg-white rounded-3xl border border-warm-100 shadow-card-lg p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-warm-900 tracking-tight">Hesap Oluştur</h1>
            <p className="text-warm-500 text-sm mt-1.5">Bilgilerinizi girerek kayıt olun.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="block text-sm font-semibold text-warm-700 mb-1.5">Ad Soyad</label>
              <input {...register('full_name')} className="input" placeholder="Dr. Ayşe Yılmaz" />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-warm-700 mb-1.5">E-posta</label>
              <input {...register('email')} type="email" className="input" placeholder="hekim@ornek.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-warm-700 mb-1.5">Şifre</label>
              <input {...register('password')} type="password" className="input" placeholder="En az 6 karakter" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-warm-700 mb-1.5">Kullanıcı Tipi</label>
              <select {...register('role')} className="input cursor-pointer">
                <option value="vet">Veteriner Hekim</option>
                <option value="owner">Hayvan Sahibi</option>
              </select>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 text-sm mt-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Kayıt Ol
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-warm-100 text-center">
            <p className="text-sm text-warm-500">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-brand-700 font-bold hover:underline">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
