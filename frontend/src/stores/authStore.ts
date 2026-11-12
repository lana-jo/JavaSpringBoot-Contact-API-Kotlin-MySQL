import { create } from 'zustand'
import { onUnauthorized, markSession, clearSessionMarker, isSessionMarked, getExpiredAt } from '../lib/token'
import { userService } from '../services/user.service'
import type { UserResponse } from '../types/api'

interface AuthState {
  /** Penanda sesi di memori (cookie HttpOnly-nya tidak bisa dibaca JS). */
  authenticated: boolean
  /** True selama probe sesi startup berjalan (cegah redirect prematur). */
  checking: boolean
  /** Waktu kedaluwarsa (ms epoch) untuk UX; bukan rahasia. */
  expiredAt: number | null
  user: UserResponse | null
  /** Dipanggil setelah login sukses: cookie sudah di-set backend. */
  login: (expiredAt: number) => void
  setUser: (user: UserResponse | null) => void
  clearSession: () => void
  /**
   * Pulihkan sesi saat reload: cookie HttpOnly tetap ada namun marker
   * memori hilang, jadi probe ke /currentUser untuk memastikan cookie valid.
   */
  restore: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  authenticated: isSessionMarked(),
  checking: !isSessionMarked(),
  expiredAt: getExpiredAt(),
  user: null,
  login: (expiredAt) => {
    markSession(expiredAt)
    set({ authenticated: true, expiredAt, user: null })
  },
  setUser: (user) => set({ user }),
  clearSession: () => {
    clearSessionMarker()
    set({ authenticated: false, expiredAt: null, user: null })
  },
  restore: async () => {
    if (isSessionMarked()) {
      set({ checking: false })
      return
    }
    try {
      const { data } = await userService.getCurrentUser({ probe: true })
      // Waktu kedaluwarsa sesungguhnya diketahui hanya backend (cookie
      // HttpOnly); 401 berikutnya yang akan mengakhiri sesi yang kedaluwarsa.
      markSession(Date.now())
      set({ authenticated: true, user: data, expiredAt: null, checking: false })
    } catch {
      set({ authenticated: false, checking: false })
    }
  },
}))

// API mengembalikan 401 (sesi hilang/kedaluwarsa) → sesi dibersihkan di
// seluruh aplikasi dan ProtectedRoute otomatis mengarahkan ke halaman login.
onUnauthorized(() => useAuthStore.getState().clearSession())
