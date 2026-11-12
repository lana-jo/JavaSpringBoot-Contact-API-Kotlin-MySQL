import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  /** Ikon dekoratif di atas judul, disembunyikan dari pembaca layar. */
  icon?: ReactNode
  /** Tombol CTA, biasanya berupa <Button>. */
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      {icon && (
        <div aria-hidden="true" className="mx-auto mb-3 flex justify-center text-4xl">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
      {action && (
        <div className="mt-4 flex justify-center">{action}</div>
      )}
    </div>
  )
}
