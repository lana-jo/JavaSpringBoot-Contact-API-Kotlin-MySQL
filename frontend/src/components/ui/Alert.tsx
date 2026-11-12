import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type AlertVariant = 'error' | 'success' | 'info'

const variantClasses: Record<AlertVariant, string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  info: 'border-indigo-200 bg-indigo-50 text-indigo-700',
}

export function Alert({
  variant = 'error',
  children,
  onDismiss,
}: {
  variant?: AlertVariant
  children: ReactNode
  /** Bila diisi, tombol tutup muncul. */
  onDismiss?: () => void
}) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${variantClasses[variant]}`}
    >
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup pesan"
          className="-mr-1 shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
