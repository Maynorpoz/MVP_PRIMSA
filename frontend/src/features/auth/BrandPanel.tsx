import { Logo } from '@/components/Logo'

export interface BrandPanelProps {
  headline: string
  body: string
}

/** The dark brand column shared by the login and register screens. */
export function BrandPanel({ headline, body }: BrandPanelProps) {
  return (
    <div className="relative hidden w-[420px] shrink-0 flex-col justify-between overflow-hidden bg-ink-950 p-12 lg:flex">
      <div className="pointer-events-none absolute -right-36 -top-32 opacity-90" aria-hidden>
        <svg width="420" height="420" viewBox="0 0 420 420" fill="none">
          <polygon points="210,20 400,380 210,300" fill="oklch(30% 0.03 55)" />
          <polygon points="210,20 20,380 210,300" fill="oklch(24% 0.025 55)" />
          <polygon points="20,380 400,380 210,300" fill="oklch(20% 0.02 55)" />
        </svg>
      </div>

      <div className="relative flex items-center gap-2.5">
        <Logo inverted size={30} />
        <span className="font-display text-2xl italic text-paper-50">Primsa</span>
      </div>

      <div className="relative flex flex-col gap-5">
        <h1 className="font-display max-w-[360px] text-4xl font-normal italic leading-tight text-paper-50">
          {headline}
        </h1>
        <p className="max-w-[340px] text-[15px] leading-relaxed text-[oklch(78%_0.015_60)]">
          {body}
        </p>
      </div>

      <p className="relative text-xs text-[oklch(55%_0.015_60)]">© 2026 Primsa</p>
    </div>
  )
}
