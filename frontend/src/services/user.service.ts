import { request } from '../lib/api'
import type { UpdateUserRequest, UserResponse } from '../types/api'

export const userService = {
  /** GET /api/currentUser */
  getCurrentUser() {
    return request<UserResponse>('/currentUser')
  },

  /** PATCH /api/currentUser — field yang tidak dikirim tidak diubah di backend. */
  updateCurrentUser(body: UpdateUserRequest) {
    return request<UserResponse>('/currentUser', { method: 'PATCH', body })
  },
}
