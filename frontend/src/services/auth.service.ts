import { request } from '../lib/api'
import type { LoginUserRequest, RegisterUserRequest, TokenResponse } from '../types/api'

export const authService = {
  /** POST /api/auth/login → { token, expired_at } */
  login(body: LoginUserRequest) {
    return request<TokenResponse>('/auth/login', { method: 'POST', body, auth: false })
  },

  /** POST /api/register → "OK" (tidak mengembalikan token; login setelahnya). */
  register(body: RegisterUserRequest) {
    return request<string>('/register', { method: 'POST', body, auth: false })
  },

  /** DELETE /api/auth/logout → "OK" (token dinonaktifkan di server). */
  logout() {
    return request<string>('/auth/logout', { method: 'DELETE' })
  },
}
