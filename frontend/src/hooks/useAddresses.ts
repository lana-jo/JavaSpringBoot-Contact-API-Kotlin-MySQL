import { useCallback, useEffect, useState } from 'react'
import { addressService } from '../services/address.service'
import type { AddressResponse, CreateAddressRequest, UpdateAddressRequest } from '../types/api'
import { getErrorMessage } from '../utils/format'

/**
 * CRUD address untuk satu contact. create/update hanya melakukan request dan
 * melempar error ke pemanggil (modal menampilkannya), sedangkan remove
 * menangkap error sendiri ke state `error` halaman.
 */
export function useAddresses(contactId: string | undefined) {
  const [addresses, setAddresses] = useState<AddressResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!contactId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await addressService.list(contactId)
      setAddresses(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat daftar alamat.'))
    } finally {
      setLoading(false)
    }
  }, [contactId])

  useEffect(() => {
    void reload()
  }, [reload])

  const create = useCallback(
    async (body: CreateAddressRequest) => {
      if (!contactId) return
      await addressService.create(contactId, body)
      await reload()
    },
    [contactId, reload],
  )

  const update = useCallback(
    async (addressId: string, body: UpdateAddressRequest) => {
      if (!contactId) return
      await addressService.update(contactId, addressId, body)
      await reload()
    },
    [contactId, reload],
  )

  const remove = useCallback(
    async (addressId: string) => {
      if (!contactId) return
      try {
        await addressService.remove(contactId, addressId)
        await reload()
      } catch (err) {
        setError(getErrorMessage(err, 'Gagal menghapus alamat.'))
      }
    },
    [contactId, reload],
  )

  return { addresses, loading, error, reload, create, update, remove }
}
