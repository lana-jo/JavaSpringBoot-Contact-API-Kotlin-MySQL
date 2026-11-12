import { useEffect, useRef } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

/** Halaman di dalamnya hanya bisa diakses bila sesi aktif (cookie sesi valid). */
export function ProtectedRoute() {
  const authenticated = useAuthStore((s) => s.authenticated)
  const checking = useAuthStore((s) => s.checking)
  const expiredAt = useAuthStore((s) => s.expiredAt)
  const restore = useAuthStore((s) => s.restore)
  const clearSession = useAuthStore((s) => s.clearSession)

  const expired = expiredAt !== null && expiredAt <= Date.now()
  const tried = useRef(false)

  useEffect(() => {
    if (expired) clearSession()
  }, [expired, clearSession])

  // Reload → marker sesi hilang, tapi cookie HttpOnly mungkin masih valid.
  // Hanya di-probe sekali per rute agar tidak ada probe berulang-ulang.
  useEffect(() => {
    if (!authenticated && !tried.current) {
      tried.current = true
      void restore()
    }
  }, [authenticated, restore])

  if (checking) return null // tunggu hasil probe sesi sebelum decide
  if (!authenticated || expired) return <Navigate to="/login" replace />

  return <Outlet />
}
