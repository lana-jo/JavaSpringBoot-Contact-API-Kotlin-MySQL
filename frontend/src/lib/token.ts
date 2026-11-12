/**
 * Status sesi web.
 *
 * Token TIDAK lagi disimpan di JavaScript: backend menaruhnya di cookie
 * HttpOnly + Secure + SameSite=Strict, jadi XSS tidak bisa membacanya.
 * Yang disimpan di sini hanya metadata non-rahasia untuk UX:
 * penanda "sedang login" dan waktu kedaluwarsa.
 */

const EXPIRED_KEY = 'contact_api_session_expired'

// Penanda sesi di memori; setelah reload ditentukan oleh probe ke backend.
let hasSession = false

export function markSession(expiredAt: number): void {
  hasSession = true
  try {
    sessionStorage.setItem(EXPIRED_KEY, String(expiredAt))
  } catch {
    /* storage diblokir: tetap jalan di memori */
  }
}

export function clearSessionMarker(): void {
  hasSession = false
  try {
    sessionStorage.removeItem(EXPIRED_KEY)
  } catch {
    /* abaikan */
  }
}

export function isSessionMarked(): boolean {
  return hasSession
}

export function getExpiredAt(): number | null {
  try {
    const raw = sessionStorage.getItem(EXPIRED_KEY)
    if (raw == null) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

type UnauthorizedListener = () => void

const listeners = new Set<UnauthorizedListener>()

/** Daftarkan callback saat API mengembalikan 401. Return fungsi untuk berhenti. */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Dipanggil lib/api.ts saat 401: bersihkan penanda sesi lalu beri tahu listener. */
export function notifyUnauthorized(): void {
  clearSessionMarker()
  listeners.forEach((listener) => listener())
}
