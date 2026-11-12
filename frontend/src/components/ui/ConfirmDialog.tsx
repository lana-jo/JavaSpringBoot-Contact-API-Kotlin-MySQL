import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  loading?: boolean
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}

/** Modal konfirmasi generik (pengganti window.confirm). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Ya, Lanjutkan',
  loading = false,
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={loading ? () => undefined : onClose}>
      <p className="text-sm text-slate-600">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
