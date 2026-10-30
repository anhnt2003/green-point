import { useId } from 'react'

interface LogoProps {
  size?: number
  /** `light` = white leaf for dark/green backgrounds. */
  tone?: 'brand' | 'light'
  className?: string
}

/** GreenPoint leaf mark: dark leaf, white stem, small light leaf. */
export function Logo({ size = 40, tone = 'brand', className }: LogoProps) {
  const id = useId()
  const leaf = tone === 'brand' ? `url(#${id}-g)` : '#ffffff'
  const stem = tone === 'brand' ? '#ffffff' : '#218048'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#1B6E3D" />
          <stop offset="1" stopColor="#2E9B57" />
        </linearGradient>
      </defs>
      <path d="M7 57C7 27 27 7 58 6c1 31-19 51-51 51Z" fill={leaf} />
      <path d="M9 56C21 43 31 33 47 18" stroke={stem} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path d="M21 45c-1-10 6-17 17-18-1 10-7 17-17 18Z" fill={tone === 'brand' ? '#9FDCAB' : '#CDEFD4'} />
    </svg>
  )
}

/** Two overlapping leaves used as decoration (points card, banners). */
export function LeafPair({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M30 54C22 36 30 16 56 8c6 24-6 42-26 46Z" fill="#7BCB86" />
      <path d="M30 54C40 40 46 28 52 14" stroke="#E6F3E8" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M28 56C10 50 4 34 12 18c16 6 22 22 16 38Z" fill="#E6F3E8" />
      <path d="M28 56C22 44 18 34 14 22" stroke="#7BCB86" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}
