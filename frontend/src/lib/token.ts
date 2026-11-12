/**
 * Penyimpanan token API di localStorage + registry listener "unauthorized".
 * Dipisah dari authStore agar lib/api.ts tidak perlu meng-import store
 * (menghindari siklus dependensi: store → service → api → store).
 */

const TOKEN_KEY = 'contact_api_token'
const EXPIRED_KEY = 'contact_api_token_expired'

export interface StoredToken {
  token: string
  expiredAt: number
}

function isStoredToken(value: unknown): value is StoredToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as StoredToken).token === 'string' &&
    typeof (value as StoredToken).expiredAt === 'number'
  )
}

export const tokenStorage = {
  get(): StoredToken | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      const expiredAt = localStorage.getItem(EXPIRED_KEY)
      if (!token || !expiredAt) return null
      const candidate: StoredToken = { token, expiredAt: Number(expiredAt) }
      return isStoredToken(candidate) && Number.isFinite(candidate.expiredAt) ? candidate : null
    } catch {
      return null
    }
  },

  set(token: string, expiredAt: number): void {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(EXPIRED_KEY, String(expiredAt))
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRED_KEY)
  },
}

type UnauthorizedListener = () => void

const listeners = new Set<UnauthorizedListener>()

/** Daftarkan callback saat API mengembalikan 401. Return fungsi untuk berhenti. */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Dipanggil lib/api.ts saat 401: bersihkan token lalu beri tahu semua listener. */
export function notifyUnauthorized(): void {
  tokenStorage.clear()
  listeners.forEach((listener) => listener())
}
