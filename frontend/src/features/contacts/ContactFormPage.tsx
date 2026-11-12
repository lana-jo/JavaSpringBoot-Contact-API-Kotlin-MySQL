import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LoadingBlock } from '../../components/ui/Spinner'
import { contactService } from '../../services/contact.service'
import { getErrorMessage } from '../../utils/format'

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '' }

interface FieldErrors {
  firstName?: string
  email?: string
}

/**
 * Satu halaman untuk create (tanpa contactId) dan edit (dengan contactId).
 * Update kontak menimpa semua field di backend, jadi form edit selalu
 * mengirim field lengkap yang sudah diisi dari data kontak saat ini.
 */
export function ContactFormPage() {
  const { contactId } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(contactId)

  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!contactId) return
    let cancelled = false
    contactService
      .get(contactId)
      .then(({ data }) => {
        if (cancelled) return
        setForm({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
        })
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

  const setField = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const errors: FieldErrors = {}
    if (!form.firstName.trim()) errors.firstName = 'Nama depan wajib diisi.'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.email = 'Format email tidak valid.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setSaving(true)
    setError(null)
    try {
      if (contactId) {
        await contactService.update(contactId, { ...form, firstName: form.firstName.trim() })
      } else {
        await contactService.create({ ...form, firstName: form.firstName.trim() })
      }
      navigate(contactId ? `/contacts/${contactId}` : '/contacts')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingBlock label="Memuat kontak..." />

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? 'Edit Kontak' : 'Tambah Kontak'}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Hanya nama depan yang wajib; field lain boleh dikosongkan.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm"
        noValidate
      >
        {error && <Alert onDismiss={() => setError(null)}>{error}</Alert>}
        <Input
          label="Nama Depan *"
          name="firstName"
          value={form.firstName}
          onChange={(e) => setField('firstName', e.target.value)}
          error={fieldErrors.firstName}
          placeholder="mis. Jeki"
          maxLength={100}
          autoFocus
        />
        <Input
          label="Nama Belakang"
          name="lastName"
          value={form.lastName}
          onChange={(e) => setField('lastName', e.target.value)}
          placeholder="mis. Joks"
          maxLength={100}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          error={fieldErrors.email}
          placeholder="mis. example@email.com"
          maxLength={100}
        />
        <Input
          label="Telepon"
          name="phone"
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value)}
          placeholder="mis. 081234567890"
          maxLength={100}
        />
        <div className="flex gap-2 pt-2">
          <Button type="submit" loading={saving}>
            {isEdit ? 'Simpan Perubahan' : 'Simpan'}
          </Button>
          <Button variant="outline" disabled={saving} onClick={() => navigate(-1)}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  )
}
