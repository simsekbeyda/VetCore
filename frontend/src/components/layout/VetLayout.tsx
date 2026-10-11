import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Search, Heart, MessageSquare, LogOut, ClipboardList } from 'lucide-react'
import VetCoreLogo from '@/components/common/VetCoreLogo'

const navItems = [
  { to: '/vet',         label: 'İlaç Arama',  icon: Search,        end: true },
  { to: '/vet/anamnez', label: 'Anamnez & AI', icon: ClipboardList },
  { to: '/vet/favorites',label: 'Favorilerim', icon: Heart },
  { to: '/vet/chatbot', label: 'AI Chatbot',   icon: MessageSquare },
]

export default function VetLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const initial = user?.full_name?.charAt(0)?.toUpperCase() ?? 'V'

  return (
    <div className="min-h-screen bg-warm-50">

      {/* Top accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-brand-800 via-brand-500 to-gold-500" />

      {/* Navbar */}
      <header className="bg-white border-b border-warm-100 shadow-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-[58px] flex items-center justify-between">

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
                        ? 'bg-brand-700 text-white shadow-sm'
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
            {/* User pill */}
            <div className="flex items-center gap-2.5 bg-warm-50 border border-warm-200 rounded-full pl-1 pr-3.5 py-1 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                {initial}
              </div>
              <span className="text-sm font-semibold text-warm-700">{user?.full_name}</span>
            </div>
            <button
              onClick={() => { logout(); navigate('/login') }}
              title="Çıkış Yap"
              className="flex items-center gap-1.5 text-warm-400 hover:text-red-500 text-sm font-medium transition-colors p-2 rounded-xl hover:bg-red-50"
            >
              <LogOut size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-7">
        <Outlet />
      </main>
    </div>
  )
}
