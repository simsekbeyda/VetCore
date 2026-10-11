import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard, Pill, FlaskConical, Cat, BookOpen, Database,
  FileSpreadsheet, AlertCircle, Users, ClipboardList, LogOut,
  MessageSquare, Layers,
} from 'lucide-react'
import VetCoreLogo from '@/components/common/VetCoreLogo'

type NavItem = { to: string; label: string; icon: typeof Pill; end?: boolean }

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Genel',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Veri Yönetimi',
    items: [
      { to: '/admin/drugs',               label: 'İlaç Yönetimi',      icon: Pill },
      { to: '/admin/ingredients',         label: 'Etken Maddeler',     icon: FlaskConical },
      { to: '/admin/species',             label: 'Hayvan Türleri',     icon: Cat },
      { to: '/admin/indications',         label: 'Endikasyonlar',      icon: BookOpen },
      { to: '/admin/therapeutic-groups',  label: 'Terapötik Gruplar',  icon: Layers },
      { to: '/admin/sources',             label: 'Kaynaklar / SPC',    icon: Database },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { to: '/admin/import',       label: 'Excel Import',   icon: FileSpreadsheet },
      { to: '/admin/missing',      label: 'Eksik Veriler',  icon: AlertCircle },
      { to: '/admin/users',        label: 'Kullanıcılar',   icon: Users },
      { to: '/admin/audit-logs',   label: 'Audit Log',      icon: ClipboardList },
      { to: '/admin/chatbot-logs', label: 'Chatbot Logları',icon: MessageSquare },
    ],
  },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }
  const initial = user?.full_name?.charAt(0)?.toUpperCase() ?? 'A'

  return (
    <div className="flex h-screen bg-warm-100 overflow-hidden">

      {/* ─── Sidebar ─── */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col bg-warm-950 shadow-2xl">

        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.05]">
          <VetCoreLogo size={30} light />
          <span className="block mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-warm-500">
            Yönetim Paneli
          </span>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navGroups.map(({ label, items }) => (
            <div key={label}>
              <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-warm-600">
                {label}
              </p>
              <div className="space-y-0.5">
                {items.map(({ to, label: lbl, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-700 text-white font-semibold shadow-sm'
                          : 'text-warm-400 hover:bg-white/[0.06] hover:text-warm-100'
                      }`
                    }
                  >
                    <Icon size={15} strokeWidth={1.8} />
                    <span className="truncate">{lbl}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-white/[0.05] pt-3">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/[0.05] mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-glow">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-warm-100 truncate">{user?.full_name}</p>
              <p className="text-[11px] text-warm-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-warm-500 hover:text-red-400 hover:bg-red-900/20 text-xs font-semibold transition-all"
          >
            <LogOut size={13} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ─── Content ─── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
