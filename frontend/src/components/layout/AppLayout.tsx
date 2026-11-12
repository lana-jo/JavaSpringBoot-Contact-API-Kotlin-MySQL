import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookUser, ChevronDown, LogOut, Users, UserCircle } from 'lucide-react'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { authService } from '../../services/auth.service'
import { userService } from '../../services/user.service'
import { useAuthStore } from '../../stores/authStore'

const NAV_ITEMS = [
  { to: '/contacts', label: 'Kontak', icon: Users },
  { to: '/profile', label: 'Profil', icon: UserCircle },
] as const

/**
 * Kerangka halaman terproteksi.
 * Desktop: sidebar navigasi + header dengan dropdown user (profil & keluar).
 * Di bawah itu: bottom navigation bar.
 */
export function AppLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (token && !user) {
      userService
        .getCurrentUser()
        .then(({ data }) => setUser(data))
        .catch(() => {
          // 401 sudah ditangani lib/api.ts (sesi dibersihkan → redirect login).
        })
    }
  }, [token, user, setUser])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await authService.logout()
    } catch {
      // Token mungkin sudah kedaluwarsa — tetap bersihkan sesi lokal.
    }
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <Header onLogout={() => setLogoutOpen(true)} />

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-4 pb-24 md:px-6 md:py-8">
          <Outlet />
        </main>

        <BottomNav />
      </div>

      <ConfirmDialog
        open={logoutOpen}
        title="Keluar dari akun?"
        description="Anda akan keluar dari sesi saat ini dan perlu masuk kembali untuk mengakses kontak Anda."
        confirmLabel="Ya, Keluar"
        loading={loggingOut}
        onConfirm={() => void handleLogout()}
        onClose={() => setLogoutOpen(false)}
      />
    </div>
  )
}

/** Navigasi samping untuk layar md ke atas. */
function Sidebar() {
  return (
    <aside className="hidden md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-slate-200 md:bg-white md:fixed md:inset-y-0 md:left-0">
      <div className="flex items-center gap-2 px-6 py-5">
        <BookUser aria-hidden="true" className="h-6 w-6 text-indigo-600" />
        <span className="text-lg font-bold text-slate-900">Contact API</span>
      </div>

      <nav aria-label="Navigasi utama" className="flex-1 space-y-1 px-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-indigo-50 font-medium text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

/** Header desktop dengan dropdown user (profil & keluar). */
function Header({ onLogout }: { onLogout: () => void }) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Tutup dropdown saat klik di luar atau Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const name = user?.name || user?.username || '...'

  return (
    <header className="hidden border-b border-slate-200 bg-white md:block">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-end px-6">
        <div ref={rootRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label="Menu pengguna"
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span
              aria-hidden="true"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white"
            >
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="max-w-40 truncate">{name}</span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-slate-400" />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  navigate('/profile')
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                <UserCircle aria-hidden="true" className="h-4 w-4" />
                Profil
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  onLogout()
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

/** Navigasi bawah untuk layar di bawah md (tablet ke bawah). */
function BottomNav() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="mx-auto flex max-w-md">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 px-3 py-2 text-xs transition ${
                isActive ? 'font-medium text-indigo-700' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Icon aria-hidden="true" className="h-6 w-6" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
