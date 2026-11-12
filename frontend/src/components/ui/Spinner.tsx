export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin text-current ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  )
}

/**
 * Blok loading tengah halaman untuk state awal data.
 * Hanya dirender (dan dibaca pembaca layar) saat `loading` bernilai true.
 * Variasi tanpa teks memakai aria-live="polite" agar status tidak
 * diumumkan dua kali.
 */
export function LoadingBlock({
  label = 'Memuat...',
  loading = true,
}: {
  label?: string
  loading?: boolean
}) {
  if (!loading) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 py-16 text-slate-500"
    >
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  )
}
