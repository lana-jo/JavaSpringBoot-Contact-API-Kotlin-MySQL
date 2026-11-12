import { useCallback, useEffect, useState } from 'react'
import { contactService } from '../services/contact.service'
import type { ContactResponse, PagingResponse } from '../types/api'
import { getErrorMessage } from '../utils/format'

export interface ContactQuery {
  query: string
  name: string
  email: string
  phone: string
  page: number // 0-based
  size: number
}

export const INITIAL_QUERY: ContactQuery = {
  query: '',
  name: '',
  email: '',
  phone: '',
  page: 0,
  size: 10,
}

/**
 * Daftar kontak + pencarian server-side + pagination, dan aksi hapus.
 * Query dikontrol dari URL (ContactListPage memakai useSearchParams),
 * sehingga pencarian bisa di-bookmark/dibagikan dan bertahan saat refresh.
 * Create/update ditangani ContactFormPage langsung via contactService.
 */
export function useContacts(query: ContactQuery) {
  const [contacts, setContacts] = useState<ContactResponse[]>([])
  const [paging, setPaging] = useState<PagingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (q: ContactQuery) => {
      setLoading(true)
      setError(null)
      try {
        const { data, paging } = await contactService.search(q)
        setContacts(data)
        setPaging(paging)
      } catch (err) {
        setError(getErrorMessage(err, 'Gagal memuat daftar kontak.'))
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    void load(query)
  }, [query, load])

  const reload = useCallback(() => load(query), [load, query])

  const remove = useCallback(
    async (contactId: string) => {
      await contactService.remove(contactId)
      // Jika satu-satunya item pada halaman > 0 terhapus, mundur satu halaman.
      const page = contacts.length === 1 && query.page > 0 ? query.page - 1 : query.page
      await load({ ...query, page })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contacts.length, query, load],
  )

  return { contacts, paging, loading, error, reload, remove }
}
