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

interface FieldErrors {
  username?: string
  password?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const login = useAuthStore((s) => s.login)
  const formRef = useRef<HTMLFormElement>(null)
  const [form, setForm] = useState({ username: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Sudah login → langsung ke daftar kontak.
  if (token) return <Navigate to="/contacts" replace />

  const validate = (): boolean => {
    const errors: FieldErrors = {}
    if (!form.username.trim()) errors.username = 'Username wajib diisi.'
    if (!form.password) errors.password = 'Password wajib diisi.'
    setFieldErrors(errors)
    // Fokus ke field pertama yang bermasalah agar keyboard user tidak tersesat.
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
      const { data } = await authService.login({
        username: form.username.trim(),
        password: form.password,
      })
      login(data.token, data.expired_at)
      navigate('/contacts', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal masuk. Periksa kembali username dan password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Masuk"
      subtitle="Masuk untuk mengelola kontak Anda."
      footer={
        <>
          Belum punya akun? <AuthLink to="/register" label="Daftar" />
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <Alert onDismiss={() => setError(null)}>{error}</Alert>}
        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={(e) => {
            setForm({ ...form, username: e.target.value })
            if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: undefined }))
          }}
          error={fieldErrors.username}
          autoComplete="username"
          placeholder="mis. lana"
          required
          autoFocus
        />
        <PasswordInput
          label="Password"
          name="password"
          value={form.password}
          onChange={(e) => {
            setForm({ ...form, password: e.target.value })
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }))
          }}
          error={fieldErrors.password}
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
        <Button type="submit" loading={loading} className="w-full">
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>
    </AuthShell>
  )
}
