import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'outline' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Menampilkan spinner dan men-disable tombol selama proses berjalan. */
  loading?: boolean
  /** Ikon dekoratif di depan label, disembunyikan dari pembaca layar. */
  icon?: ReactNode
  /** Label untuk pembaca layar; berguna saat children hanya ikon. */
  'aria-label'?: string
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-9 px-3 py-1.5',
  md: 'min-h-11 px-4 py-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className = '',
  children,
  type,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-disabled={disabled || loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Spinner className="h-4 w-4" />
      ) : (
        icon && (
          <span aria-hidden="true" className="inline-flex items-center">
            {icon}
          </span>
        )
      )}
      {children}
    </button>
  )
}
