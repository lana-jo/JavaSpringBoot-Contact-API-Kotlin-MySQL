import { notifyUnauthorized, isSessionMarked } from './token'
import type { PagingResponse } from '../types/api'

/** Error dari API berisi pesan backend (`errorMessage`) dan HTTP status. */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

interface WebEnvelope<T> {
  data: T | null
  errorMessage: string | null
  paging: PagingResponse | null
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Endpoint publik (login/register) tidak butuh sesi. */
  auth?: boolean
  /** Lewati cek marker sesi namun tetap kirim cookie (untuk probe startup). */
  probe?: boolean
}

const BASE = '/api' // diproxykan Vite ke http://localhost:8081 saat development

export async function request<T>(
  path: string,
  { method = 'GET', body, auth = true, probe = false }: RequestOptions = {},
): Promise<{ data: T; paging: PagingResponse | null }> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    // Header custom: wajib untuk request state-changing via cookie (anti-CSRF).
    'X-Requested-With': 'XMLHttpRequest',
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth && !probe && !isSessionMarked()) {
    throw new ApiError('Belum masuk. Silakan login terlebih dahulu.', 401)
  }

  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      // Kirim cookie HttpOnly ke origin yang sama.
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8081.', 0)
  }

  let envelope: WebEnvelope<T> | null = null
  try {
    envelope = (await response.json()) as WebEnvelope<T>
  } catch {
    // Body bukan JSON (mis. error default Spring) — dibiarkan null.
  }

  if (response.status === 401) notifyUnauthorized()

  if (!response.ok) {
    throw new ApiError(
      envelope?.errorMessage ?? `Terjadi kesalahan pada server (HTTP ${response.status}).`,
      response.status,
    )
  }

  if (envelope?.errorMessage) throw new ApiError(envelope.errorMessage, response.status)

  return { data: envelope?.data as T, paging: envelope?.paging ?? null }
}
