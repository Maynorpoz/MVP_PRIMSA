import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-ink-950 hover:bg-brand-hover facet-cut',
  secondary: 'bg-transparent text-ink-950 border border-paper-200 hover:border-ink-400 rounded-sm',
  ghost: 'bg-transparent text-ink-950 hover:bg-paper-100 rounded-sm',
}

/**
 * The only button component in the app. Presentational only — no knowledge
 * of what it triggers. `variant="primary"` carries the brand's facet-cut
 * corner (see index.css); use it for the one primary action per screen.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', isLoading = false, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 px-5 text-sm font-semibold font-sans transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {isLoading && <Spinner size={16} />}
      {children}
    </button>
  )
})
