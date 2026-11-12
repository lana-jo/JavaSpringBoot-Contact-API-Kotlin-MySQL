import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
}

/** Input password dengan tombol tampilkan/sembunyikan (a11y: aria-pressed). */
export function PasswordInput({ label, error, id, name, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? name ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none transition focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
          }`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-slate-400 transition hover:text-slate-600"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Eye aria-hidden="true" className="h-4 w-4" />
          )}
          <span className="sr-only">{visible ? 'Sembunyikan password' : 'Tampilkan password'}</span>
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
