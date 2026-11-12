import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, SearchX, Users } from 'lucide-react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { Pagination } from '../../components/ui/Pagination'
import { SkeletonList } from '../../components/ui/Skeleton'
import { INITIAL_QUERY, useContacts } from '../../hooks/useContacts'
import { getErrorMessage } from '../../utils/format'
import type { ContactResponse } from '../../types/api'


/** Ambil nilai param `page` dari URL sebagai angka 0-based yang aman. */
function parsePage(raw: string | null): number {
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

/**
 * Daftar kontak: pencarian + halaman dikontrol dari URL (?q=&page=) sehingga
 * bisa di-bookmark, dibagikan, dan bertahan saat refresh / navigasi back.
 */
export function ContactListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [deleteTarget, setDeleteTarget] = useState<ContactResponse | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const query = searchParams.get('q') ?? ''
  const page = parsePage(searchParams.get('page'))

  // Identitas stabil agar efek di hook hanya berjalan saat query berubah.
  const contactQuery = useMemo(
    () => ({ ...INITIAL_QUERY, query, page }),
    [query, page],
  )
  const { contacts, paging, loading, error, reload, remove } = useContacts(contactQuery)

  const [searchQuery, setSearchQuery] = useState(query)

  // Sinkronkan input pencarian bila URL berubah dari luar (back/forward).
  useEffect(() => {
    setSearchQuery(query)
  }, [query])

  const applySearchParams = (q: string, page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (q) next.set('q', q)
      else next.delete('q')
      if (page > 0) next.set('page', String(page))
      else next.delete('page')
      return next
    })
  }

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    applySearchParams(searchQuery.trim(), 0)
  }

  const handleReset = () => {
    setSearchQuery('')
    applySearchParams('', 0)
  }

  const handlePageChange = (newPage: number) => {
    applySearchParams(query, newPage)
  }

  const handleDelete = async () => {
    if (!deleteTarget?.id) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await remove(deleteTarget.id)
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'Gagal menghapus kontak.'))
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const deleteLabel = deleteTarget
    ? [deleteTarget.firstName, deleteTarget.lastName].filter(Boolean).join(' ') || '(tanpa nama)'
    : ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Kontak</h1>
        <Button onClick={() => navigate('/contacts/new')}>+ Tambah Kontak</Button>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex items-end gap-3 rounded-xl bg-white p-4 shadow-sm"
        role="search"
      >
        <div className="flex-1">
          <Input
            label="Cari Kontak"
            name="query"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, email, atau no telepon..."
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="outline">
            Cari
          </Button>
          {searchQuery && (
            <Button variant="ghost" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
      </form>

      {deleteError && <Alert onDismiss={() => setDeleteError(null)}>{deleteError}</Alert>}

      <div className="rounded-xl bg-white shadow-sm">
        {loading ? (
          <SkeletonList rows={5} />
        ) : error ? (
          <div className="p-4">
            <Alert>{error}</Alert>
            <div className="mt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => void reload()}>
                Coba Lagi
              </Button>
            </div>
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={
              query ? (
                <SearchX aria-hidden="true" className="h-10 w-10 text-slate-300" />
              ) : (
                <Users aria-hidden="true" className="h-10 w-10 text-slate-300" />
              )
            }
            title={query ? 'Tidak ada kontak yang cocok' : 'Belum ada kontak'}
            description={
              query
                ? `Tidak ada kontak yang cocok dengan pencarian "${query}".`
                : 'Tambahkan kontak pertama Anda untuk mulai.'
            }
            action={
              query ? (
                <Button variant="outline" onClick={handleReset}>
                  Hapus pencarian
                </Button>
              ) : (
                <Button onClick={() => navigate('/contacts/new')}>
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Tambah Kontak
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Telepon</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {[contact.firstName, contact.lastName].filter(Boolean).join(' ') || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{contact.email ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{contact.phone ?? '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                      >
                        Detail
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/contacts/${contact.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(contact)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 pb-4">
          <Pagination
            currentPage={paging?.currentPage ?? page}
            totalPage={paging?.totalPage ?? 1}
            onPageChange={handlePageChange}
            disabled={loading}
          />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus kontak?"
        description={`Kontak "${deleteLabel}" beserta semua alamatnya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, Hapus"
        danger
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
