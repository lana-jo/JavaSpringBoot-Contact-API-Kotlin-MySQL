import { notifyUnauthorized, tokenStorage } from './token'
import type { PagingResponse } from '../types/api'

/** Error dari API berisi pesan backend (`errorMessage`) dan HTTP status. */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Envelope semua response backend: `WebResponse<T>`.
 * Field null tetap ada di JSON karena Jackson memakai default serialization.
 */
interface WebEnvelope<T> {
  data: T | null
  errorMessage: string | null
  paging: PagingResponse | null
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Kirim header X-API-TOKEN (default true; login/register memakai false). */
  auth?: boolean
}

const BASE = '/api' // diproxykan Vite ke http://localhost:8081 saat development

export async function request<T>(
  path: string,
  { method = 'GET', body, auth = true }: RequestOptions = {},
): Promise<{ data: T; paging: PagingResponse | null }> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth) {
    const stored = tokenStorage.get()
    if (!stored) throw new ApiError('Belum masuk. Silakan login terlebih dahulu.', 401)
    headers['X-API-TOKEN'] = stored.token
  }

  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
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
