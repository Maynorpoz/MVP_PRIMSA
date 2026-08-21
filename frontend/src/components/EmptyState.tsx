import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

/**
 * Generic empty/secondary-state layout (empty cart, no orders today,
 * unauthorized...). The icon and action are passed in — this component has
 * no idea what state it's rendering, only how to lay one out consistently.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-paper-200 bg-paper-50 p-4 text-ink-400">
        {icon}
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold text-ink-950">{title}</h2>
        <p className="max-w-sm text-sm leading-relaxed text-ink-700">{description}</p>
      </div>
      {action}
    </div>
  )
}
