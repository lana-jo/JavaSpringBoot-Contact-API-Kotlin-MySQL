/**
 * Tipe data yang mencerminkan kontrak API backend (Kotlin Spring Boot).
 * Perhatikan: semua field sesuai JSON backend — `expired_at` snake_case,
 * sisanya camelCase; field nullable di backend ditandai `| null`.
 */

// ---------- envelope ----------
export interface PagingResponse {
  currentPage: number // 0-based
  totalPage: number
  size: number
}

// ---------- auth ----------
export interface LoginUserRequest {
  username: string
  password: string
}

export interface RegisterUserRequest {
  username: string
  password: string
  name: string
}

/** Field `expired_at` memang snake_case di backend (epoch milliseconds). */
export interface TokenResponse {
  token: string
  expired_at: number
}

// ---------- user ----------
export interface UserResponse {
  username: string | null
  name: string | null
}

/** Backend: field null/absen berarti "tidak diubah". */
export interface UpdateUserRequest {
  name?: string | null
  password?: string | null
}

// ---------- contact ----------
export interface ContactResponse {
  id: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
}

/**
 * Update kontak menimpa SEMUA field di backend, jadi form edit
 * harus selalu mengirim field lengkap (lihat ContactService.update).
 */
export interface CreateContactRequest {
  firstName: string
  lastName?: string | null
  email?: string | null
  phone?: string | null
}

export interface UpdateContactRequest {
  firstName: string
  lastName?: string | null
  email?: string | null
  phone?: string | null
}

export interface ContactSearchParams {
  query?: string
  name?: string
  email?: string
  phone?: string
  page?: number
  size?: number
}

// ---------- address (nested di contact) ----------
export interface AddressResponse {
  id: string | null
  street: string | null
  city: string | null
  province: string | null
  country: string | null
  postalCode: string | null
}

/** Hanya `country` yang wajib diisi. */
export interface CreateAddressRequest {
  street?: string | null
  city?: string | null
  province?: string | null
  country: string
  postalCode?: string | null
}

export interface UpdateAddressRequest {
  street?: string | null
  city?: string | null
  province?: string | null
  country: string
  postalCode?: string | null
}
