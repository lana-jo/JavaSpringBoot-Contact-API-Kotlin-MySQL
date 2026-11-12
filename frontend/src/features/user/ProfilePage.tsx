import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { useProfile } from '../../hooks/useProfile'
import { useAuthStore } from '../../stores/authStore'

const MIN_PASSWORD_LENGTH = 8

interface FieldErrors {
  name?: string
  password?: string
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const { update, saving, error, success } = useProfile()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // Sinkronkan form saat data user selesai dimuat oleh AppLayout.
  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

  const validate = (): boolean => {
    const errors: FieldErrors = {}
    if (name.trim() && name.trim().length > 100) errors.name = 'Nama maksimal 100 karakter.'
    if (password && password.length < MIN_PASSWORD_LENGTH)
      errors.password = `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    // Backend: field yang tidak dikirim (undefined) tidak akan diubah.
    const updated = await update({
      name: name.trim() || undefined,
      password: password || undefined,
    })
    if (updated) setPassword('')
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900">Profil</h1>
      <p className="mt-1 text-sm text-slate-500">Kelola informasi akun Anda.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm"
        noValidate
      >
        {error && <Alert>{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">Username</span>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
            {user?.username ?? '...'} <span className="text-xs">(tidak dapat diubah)</span>
          </p>
        </div>

        <Input
          label="Nama"
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }))
          }}
          error={fieldErrors.name}
          placeholder="Nama baru (kosongkan bila tidak diubah)"
          maxLength={100}
        />
        <PasswordInput
          label="Password Baru"
          name="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }))
          }}
          error={fieldErrors.password}
          placeholder={`Kosongkan bila tidak diubah (min. ${MIN_PASSWORD_LENGTH} karakter)`}
          autoComplete="new-password"
        />

        <Button type="submit" loading={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </form>
    </div>
  )
}
