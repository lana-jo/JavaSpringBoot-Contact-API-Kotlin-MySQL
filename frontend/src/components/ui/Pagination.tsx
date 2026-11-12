import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

interface PaginationProps {
  /** Halaman saat ini dari backend, 0-based. */
  currentPage: number
  totalPage: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ currentPage, totalPage, onPageChange, disabled = false }: PaginationProps) {
  if (totalPage <= 1) return null

  const prevDisabled = disabled || currentPage <= 0
  const nextDisabled = disabled || currentPage >= totalPage - 1

  return (
    <nav
      aria-label="Navigasi halaman kontak"
      className="flex items-center justify-between pt-4"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={prevDisabled}
        aria-disabled={prevDisabled || undefined}
        aria-label="Halaman sebelumnya"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Sebelumnya
      </Button>
      <span
        aria-current="page"
        className="text-sm text-slate-600"
      >
        Halaman {currentPage + 1} dari {totalPage}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={nextDisabled}
        aria-disabled={nextDisabled || undefined}
        aria-label="Halaman berikutnya"
        onClick={() => onPageChange(currentPage + 1)}
      >
        Berikutnya
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Button>
    </nav>
  )
}
