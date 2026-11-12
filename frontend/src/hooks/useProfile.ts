import { useCallback, useState } from 'react'
import { userService } from '../services/user.service'
import { useAuthStore } from '../stores/authStore'
import type { UpdateUserRequest } from '../types/api'
import { getErrorMessage } from '../utils/format'

/** Update profil; setelah sukses, user di navbar ikut terbarui. */
export function useProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const update = useCallback(
    async (body: UpdateUserRequest): Promise<boolean> => {
      setSaving(true)
      setError(null)
      setSuccess(null)
      try {
        const { data } = await userService.updateCurrentUser(body)
        setUser(data)
        setSuccess('Profil berhasil diperbarui.')
        return true
      } catch (err) {
        setError(getErrorMessage(err, 'Gagal memperbarui profil.'))
        return false
      } finally {
        setSaving(false)
      }
    },
    [setUser],
  )

  return { update, saving, error, success }
}
