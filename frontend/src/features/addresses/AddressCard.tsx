import { Button } from '../../components/ui/Button'
import type { AddressResponse } from '../../types/api'

interface AddressCardProps {
  address: AddressResponse
  deleting?: boolean
  onEdit: () => void
  onDelete: () => void
}

function orDash(value: string | null | undefined): string {
  return value?.trim() ? value : '-'
}

export function AddressCard({ address, deleting = false, onEdit, onDelete }: AddressCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="font-medium text-slate-800">{orDash(address.street)}</p>
      <p className="mt-1 text-sm text-slate-600">
        {orDash(address.city)}
        {address.province?.trim() ? `, ${address.province}` : ''}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {orDash(address.country)}
        {address.postalCode?.trim() ? ` · ${address.postalCode}` : ''}
      </p>
      <div className="mt-3 flex justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50"
          onClick={onDelete}
          loading={deleting}
        >
          Hapus
        </Button>
      </div>
    </div>
  )
}
