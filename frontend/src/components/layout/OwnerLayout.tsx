import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PawPrint, User, Search, LogOut, MessageSquare } from 'lucide-react'
import VetCoreLogo from '@/components/common/VetCoreLogo'

const navItems = [
  { to: '/owner',          label: 'Hayvanlarım', icon: PawPrint, end: true },
  { to: '/owner/drugs',    label: 'İlaç Ara',    icon: Search },
  { to: '/owner/chatbot',  label: 'AI Asistan',  icon: MessageSquare },
  { to: '/owner/profile',  label: 'Profilim',    icon: User },
]

export default function OwnerLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const initial = user?.full_name?.charAt(0)?.toUpperCase() ?? 'H'

  return (
    <div className="min-h-screen bg-warm-50">

      {/* Top accent bar — amber/gold for owner */}
      <div className="h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-brand-600" />

      {/* Navbar */}
      <header className="bg-white border-b border-warm-100 shadow-nav sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-[58px] flex items-center justify-between">

          <div className="flex items-center gap-8">
            <VetCoreLogo size={30} />

            <nav className="flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-gold-600 text-white shadow-sm'
                        : 'text-warm-500 hover:bg-warm-100 hover:text-warm-900'
                    }`
                  }
                >
                  <Icon size={14} strokeWidth={1.8} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 bg-warm-50 border border-warm-200 rounded-full pl-1 pr-3.5 py-1 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                {initial}
              </div>
              <span className="text-sm font-semibold text-warm-700">{user?.full_name}</span>
            </div>
            <button
              onClick={() => { logout(); navigate('/login') }}
              title="Çıkış Yap"
              className="flex items-center text-warm-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
            >
              <LogOut size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-7">
        <Outlet />
      </main>
    </div>
  )
}
