import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PasswordInput } from '../../components/ui/PasswordInput'
import { authService } from '../../services/auth.service'
import { useAuthStore } from '../../stores/authStore'
import { getErrorMessage } from '../../utils/format'
import { AuthLink, AuthShell } from './AuthShell'

const MIN_PASSWORD_LENGTH = 8

interface FieldErrors {
  name?: string
  username?: string
  password?: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const login = useAuthStore((s) => s.login)
  const formRef = useRef<HTMLFormElement>(null)
  const [form, setForm] = useState({ name: '', username: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (token) return <Navigate to="/contacts" replace />

  const validate = (): boolean => {
    const errors: FieldErrors = {}
    if (!form.name.trim()) errors.name = 'Nama lengkap wajib diisi.'
    if (!form.username.trim()) errors.username = 'Username wajib diisi.'
    if (form.password.length < MIN_PASSWORD_LENGTH)
      errors.password = `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
        firstInvalid?.focus()
      })
    }
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (loading || !validate()) return
    setLoading(true)
    setError(null)
    try {
      // Register tidak mengembalikan token → langsung login otomatis.
      await authService.register({
        name: form.name.trim(),
        username: form.username.trim(),
        password: form.password,
      })
      const { data } = await authService.login({
        username: form.username.trim(),
        password: form.password,
      })
      login(data.token, data.expired_at)
      navigate('/contacts', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mendaftar. Coba lagi.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Daftar"
      subtitle="Buat akun baru untuk mulai mengelola kontak."
      footer={
        <>
          Sudah punya akun? <AuthLink to="/login" label="Masuk" />
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert onDismiss={() => setError(null)}>{error}</Alert>}
        <Input
          label="Nama Lengkap *"
          name="name"
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value })
            if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }))
          }}
          error={fieldErrors.name}
          autoComplete="name"
          placeholder="mis. Muhammad Lana Jauharul"
          maxLength={100}
          required
          autoFocus
        />
        <Input
          label="Username *"
          name="username"
          value={form.username}
          onChange={(e) => {
            setForm({ ...form, username: e.target.value })
            if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: undefined }))
          }}
          error={fieldErrors.username}
          autoComplete="username"
          placeholder="mis. lana"
          maxLength={100}
          required
        />
        <PasswordInput
          label="Password *"
          name="password"
          value={form.password}
          onChange={(e) => {
            setForm({ ...form, password: e.target.value })
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }))
          }}
          error={fieldErrors.password}
          autoComplete="new-password"
          placeholder={`Minimal ${MIN_PASSWORD_LENGTH} karakter`}
          required
        />
        {!fieldErrors.password && (
          <p className="-mt-2 text-xs text-slate-500">
            Gunakan minimal {MIN_PASSWORD_LENGTH} karakter.
          </p>
        )}
        <Button type="submit" loading={loading} className="w-full">
          {loading ? 'Mendaftar...' : 'Daftar'}
        </Button>
      </form>
    </AuthShell>
  )
}
