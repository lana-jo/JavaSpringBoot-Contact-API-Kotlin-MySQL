
/** Placeholder skeleton (diutamakan daripada spinner) untuk daftar yang loading. */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-4" aria-busy="true" aria-label="Memuat">
      <span className="sr-only">Memuat...</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-0">
          <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
          <div className="hidden h-5 w-1/4 animate-pulse rounded bg-slate-100 sm:block" />
          <div className="ml-auto h-5 w-1/6 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}
