import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

/** Halaman di dalamnya hanya bisa diakses bila punya token (sudah login). */
export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  const expiredAt = useAuthStore((s) => s.expiredAt)
  const clearSession = useAuthStore((s) => s.clearSession)

  const expired = expiredAt !== null && expiredAt <= Date.now()

  useEffect(() => {
    if (expired) clearSession()
  }, [expired, clearSession])

  if (!token || expired) return <Navigate to="/login" replace />

  return <Outlet />
}
