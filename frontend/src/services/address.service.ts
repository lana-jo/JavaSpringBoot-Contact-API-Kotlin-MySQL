import { request } from '../lib/api'
import type {
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '../types/api'

// Address selalu nested di bawah contact: /api/contacts/{contactId}/addresses
export const addressService = {
  /** GET /api/contacts/{contactId}/addresses — tanpa pagination. */
  list(contactId: string) {
    return request<AddressResponse[]>(`/contacts/${contactId}/addresses`)
  },

  /** GET /api/contacts/{contactId}/addresses/{addressId} */
  get(contactId: string, addressId: string) {
    return request<AddressResponse>(`/contacts/${contactId}/addresses/${addressId}`)
  },

  /** POST /api/contacts/{contactId}/addresses */
  create(contactId: string, body: CreateAddressRequest) {
    return request<AddressResponse>(`/contacts/${contactId}/addresses`, { method: 'POST', body })
  },

  /** PUT /api/contacts/{contactId}/addresses/{addressId} */
  update(contactId: string, addressId: string, body: UpdateAddressRequest) {
    return request<AddressResponse>(`/contacts/${contactId}/addresses/${addressId}`, {
      method: 'PUT',
      body,
    })
  },

  /** DELETE /api/contacts/{contactId}/addresses/{addressId} */
  remove(contactId: string, addressId: string) {
    return request<string>(`/contacts/${contactId}/addresses/${addressId}`, { method: 'DELETE' })
  },
}
