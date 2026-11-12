import { create } from 'zustand'
import { onUnauthorized, tokenStorage } from '../lib/token'
import type { UserResponse } from '../types/api'

interface AuthState {
  token: string | null
  expiredAt: number | null
  user: UserResponse | null
  /** Simpan token hasil login (persist di localStorage). */
  login: (token: string, expiredAt: number) => void
  setUser: (user: UserResponse | null) => void
  clearSession: () => void
}

const stored = tokenStorage.get()

export const useAuthStore = create<AuthState>((set) => ({
  token: stored?.token ?? null,
  expiredAt: stored?.expiredAt ?? null,
  user: null,
  login: (token, expiredAt) => {
    tokenStorage.set(token, expiredAt)
    set({ token, expiredAt, user: null })
  },
  setUser: (user) => set({ user }),
  clearSession: () => {
    tokenStorage.clear()
    set({ token: null, expiredAt: null, user: null })
  },
}))

// API mengembalikan 401 (token hilang/kedaluwarsa) → sesi dibersihkan di
// seluruh aplikasi dan ProtectedRoute otomatis mengarahkan ke halaman login.
onUnauthorized(() => useAuthStore.getState().clearSession())
