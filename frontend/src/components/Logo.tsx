export interface LogoProps {
  /** Use on a dark background (nav bars, the auth brand panel). */
  inverted?: boolean
  size?: number
  className?: string
}

/**
 * The Primsa mark: a triangle split into three facets, from the Fase 2
 * design system. Pair with the wordmark via <Logo /> + a styled "Primsa"
 * span — kept separate so callers can control the wordmark's tag/size.
 */
export function Logo({ inverted = false, size = 24, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className={className}>
      <polygon points="14,2 26,24 14,17" fill="oklch(62% 0.16 55)" />
      <polygon points="14,2 2,24 14,17" fill="oklch(54% 0.16 53)" />
      <polygon
        points="2,24 26,24 14,17"
        fill={inverted ? 'oklch(98.5% 0.008 80)' : 'oklch(18% 0.02 55)'}
      />
    </svg>
  )
}
