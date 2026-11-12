import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingBlock } from '../../components/ui/Spinner'
import { useAddresses } from '../../hooks/useAddresses'
import { contactService } from '../../services/contact.service'
import type { AddressResponse, ContactResponse } from '../../types/api'
import { getErrorMessage } from '../../utils/format'
import { AddressCard } from '../addresses/AddressCard'
import { AddressFormModal } from '../addresses/AddressFormModal'

/** Detail satu kontak + pengelolaan alamat (nested) milik kontak tersebut. */
export function ContactDetailPage() {
  const { contactId } = useParams()
  const navigate = useNavigate()

  const [contact, setContact] = useState<ContactResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const {
    addresses,
    loading: addressesLoading,
    error: addressesError,
    create,
    update,
    remove,
  } = useAddresses(contactId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)
  const [addressToDelete, setAddressToDelete] = useState<AddressResponse | null>(null)

  useEffect(() => {
    if (!contactId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    contactService
      .get(contactId)
      .then(({ data }) => {
        if (!cancelled) setContact(data)
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Kontak tidak ditemukan.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [contactId])

  const confirmDeleteContact = async () => {
    if (!contactId) return
    setDeleting(true)
    setError(null)
    try {
      await contactService.remove(contactId)
      navigate('/contacts')
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menghapus kontak.'))
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteAddress = async () => {
    if (!addressToDelete?.id) return
    setDeletingAddressId(addressToDelete.id)
    await remove(addressToDelete.id)
    setDeletingAddressId(null)
    setAddressToDelete(null)
  }

  if (loading) return <LoadingBlock label="Memuat kontak..." />

  if (error || !contact) {
    return (
      <EmptyState
        icon={<SearchX aria-hidden="true" className="h-10 w-10 text-slate-300" />}
        title="Kontak tidak ditemukan"
        description="Kontak mungkin telah dihapus atau alamatnya salah."
        action={
          <Link to="/contacts">
            <Button variant="outline">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Kembali ke Daftar Kontak
            </Button>
          </Link>
        }
      />
    )
  }

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ')

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Kembali
      </Button>

      {error && <Alert onDismiss={() => setError(null)}>{error}</Alert>}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{fullName || '(tanpa nama)'}</h1>
          <dl className="mt-3 space-y-1 text-sm text-slate-600">
            <div>
              <span className="inline-block w-20 text-slate-400">Email</span>
              {contact.email ?? '-'}
            </div>
            <div>
              <span className="inline-block w-20 text-slate-400">Telepon</span>
              {contact.phone ?? '-'}
            </div>
          </dl>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/contacts/${contact.id}/edit`)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            Hapus
          </Button>
        </div>
      </div>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Alamat</h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingAddress(null)
              setModalOpen(true)
            }}
          >
            + Tambah Alamat
          </Button>
        </div>

        {addressesError && (
          <div className="mt-4">
            <Alert>{addressesError}</Alert>
          </div>
        )}

        {addressesLoading ? (
          <LoadingBlock label="Memuat alamat..." />
        ) : addresses.length === 0 && !addressesError ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Belum ada alamat untuk kontak ini.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                deleting={address.id === deletingAddressId}
                onEdit={() => {
                  setEditingAddress(address)
                  setModalOpen(true)
                }}
                onDelete={() => setAddressToDelete(address)}
              />
            ))}
          </div>
        )}
      </section>

      <AddressFormModal
        open={modalOpen}
        initial={editingAddress}
        onClose={() => setModalOpen(false)}
        onSubmit={(body) =>
          editingAddress?.id ? update(editingAddress.id, body) : create(body)
        }
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Hapus kontak?"
        description={`Kontak "${fullName}" beserta semua alamatnya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, Hapus"
        danger
        loading={deleting}
        onConfirm={() => void confirmDeleteContact()}
        onClose={() => setDeleteOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(addressToDelete)}
        title="Hapus alamat?"
        description="Alamat ini akan dihapus permanen dari kontak. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, Hapus"
        danger
        loading={Boolean(deletingAddressId)}
        onConfirm={() => void handleDeleteAddress()}
        onClose={() => setAddressToDelete(null)}
      />
    </div>
  )
}
