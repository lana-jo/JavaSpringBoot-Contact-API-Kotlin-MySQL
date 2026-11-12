import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
  /** Teks bantuan tambahan; error selalu diprioritaskan. */
  helperText?: string | null
}

export function Input({ label, error, helperText, id, ...rest }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? `${rest.name ?? label.toLowerCase().replace(/\s+/g, '-')}-${generatedId}`
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`
  const description = error ?? helperText

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={description ? (error ? errorId : helperId) : undefined}
        aria-errormessage={error ? errorId : undefined}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
        }`}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  )
}
