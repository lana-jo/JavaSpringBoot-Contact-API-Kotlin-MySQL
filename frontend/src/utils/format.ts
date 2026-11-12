import { ApiError } from '../lib/api'

/** Ambil pesan yang siap ditampilkan dari error apa pun. */
export function getErrorMessage(err: unknown, fallback = 'Terjadi kesalahan. Coba lagi.'): string {
  let message = fallback
  if (err instanceof ApiError && err.message) message = err.message
  else if (err instanceof Error && err.message) message = err.message

  // Spring menampilkan ResponseStatusException sebagai `401 UNAUTHORIZED "pesan"`.
  const withStatus = message.match(/^\d{3}\s+[A-Z_ ]+\s+"(.*)"$/)
  if (withStatus) message = withStatus[1]

  return friendlyValidationMessage(message)
}

/**
 * Pesan validasi backend berbentuk `path.field: pesan` (bisa lebih dari satu,
 * dipisah ";"). Ambil hanya bagian setelah ': ' agar mudah dibaca pengguna.
 */
export function friendlyValidationMessage(message: string): string {
  return message
    .split(';')
    .map((part) => {
      const idx = part.indexOf(': ')
      return (idx >= 0 ? part.slice(idx + 2) : part).trim()
    })
    .filter(Boolean)
    .join(', ')
}
