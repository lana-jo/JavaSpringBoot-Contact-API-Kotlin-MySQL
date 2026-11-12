import { request } from '../lib/api'
import type {
  ContactResponse,
  ContactSearchParams,
  CreateContactRequest,
  UpdateContactRequest,
} from '../types/api'

export const contactService = {
  /** POST /api/contacts/create — path khusus create (GET /api/contacts = search). */
  create(body: CreateContactRequest) {
    return request<ContactResponse>('/contacts/create', { method: 'POST', body })
  },

  /** GET /api/contacts/{contactId} */
  get(contactId: string) {
    return request<ContactResponse>(`/contacts/${contactId}`)
  },

  /** PUT /api/contacts/{contactId} — id hanya dari path, tidak di body. */
  update(contactId: string, body: UpdateContactRequest) {
    return request<ContactResponse>(`/contacts/${contactId}`, { method: 'PUT', body })
  },

  /** DELETE /api/contacts/{contactId} */
  remove(contactId: string) {
    return request<string>(`/contacts/${contactId}`, { method: 'DELETE' })
  },

  /** GET /api/contacts?query=&page=&size= — 0-based pagination. */
  search({ query, name, email, phone, page = 0, size = 10 }: ContactSearchParams) {
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (name) params.set('name', name)
    if (email) params.set('email', email)
    if (phone) params.set('phone', phone)
    params.set('page', String(page))
    params.set('size', String(size))
    return request<ContactResponse[]>(`/contacts?${params.toString()}`)
  },
}
