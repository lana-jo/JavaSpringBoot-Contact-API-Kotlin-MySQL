import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import type { AddressResponse, CreateAddressRequest } from '../../types/api'
import { getErrorMessage } from '../../utils/format'

interface AddressFormModalProps {
  open: boolean
  /** Address yang diedit; null berarti mode tambah. */
  initial?: AddressResponse | null
  /** Dilempar error dari hook (validasi backend) akan tampil di dalam modal. */
  onSubmit: (body: CreateAddressRequest) => Promise<void>
  onClose: () => void
}

const EMPTY_FORM = { street: '', city: '', province: '', country: '', postalCode: '' }

/** Modal form address (tambah/edit). Hanya `country` yang wajib di backend. */
export function AddressFormModal({ open, initial, onSubmit, onClose }: AddressFormModalProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm(
      initial
        ? {
            street: initial.street ?? '',
            city: initial.city ?? '',
            province: initial.province ?? '',
            country: initial.country ?? '',
            postalCode: initial.postalCode ?? '',
          }
        : EMPTY_FORM,
    )
    setError(null)
  }, [open, initial])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.country.trim()) {
      setError('Country dibutuhkan.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ ...form })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} title={initial ? 'Edit Alamat' : 'Tambah Alamat'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <Alert>{error}</Alert>}
        <Input
          label="Jalan"
          name="street"
          value={form.street}
          onChange={(e) => setForm({ ...form, street: e.target.value })}
          placeholder="mis. Jl. Merdeka No. 10"
          maxLength={100}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Kota"
            name="city"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="mis. Semarang"
            maxLength={100}
          />
          <Input
            label="Provinsi"
            name="province"
            value={form.province}
            onChange={(e) => setForm({ ...form, province: e.target.value })}
            placeholder="mis. Jawa Tengah"
            maxLength={100}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Negara *"
            name="country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            placeholder="mis. Indonesia"
            maxLength={100}
          />
          <Input
            label="Kode Pos"
            name="postalCode"
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            placeholder="mis. 50123"
            maxLength={100}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={saving}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  )
}
