import { cn } from '@/lib/cn'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastProps {
  message: string
  variant?: ToastVariant
  onClose: () => void
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'bg-success-tint text-ink-950 border-success/30',
  error: 'bg-danger-tint text-ink-950 border-danger/30',
  info: 'bg-paper-100 text-ink-950 border-paper-200',
}

export function Toast({ message, variant = 'info', onClose }: ToastProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-3 rounded-sm border px-4 py-3 text-sm shadow-elevated',
        VARIANT_CLASSES[variant],
      )}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="text-ink-400 hover:text-ink-950"
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
