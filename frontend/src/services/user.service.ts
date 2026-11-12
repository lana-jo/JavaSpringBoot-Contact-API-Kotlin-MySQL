import { request } from '../lib/api'
import type { UpdateUserRequest, UserResponse } from '../types/api'

export const userService = {
  /** GET /api/currentUser — juga dipakai untuk probe sesi saat startup. */
  getCurrentUser(options: { probe?: boolean } = {}) {
    return request<UserResponse>('/currentUser', { probe: options.probe })
  },

  /** PATCH /api/currentUser — field yang tidak dikirim tidak diubah di backend. */
  updateCurrentUser(body: UpdateUserRequest) {
    return request<UserResponse>('/currentUser', { method: 'PATCH', body })
  },
}
