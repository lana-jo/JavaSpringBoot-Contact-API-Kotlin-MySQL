import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthShellProps {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

/**
 * Kartu terpusat yang dipakai bersama oleh LoginPage dan RegisterPage.
 * Kartu memakai <section> berlabel judul agar pembaca layar mendengar
 * nama halaman sebelum masuk ke form.
 */
export function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <main className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6 space-y-4">{children}</div>
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>
      </main>
    </div>
  )
}

export function AuthLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      {label}
    </Link>
  )
}
