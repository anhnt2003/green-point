import type { WasteCode } from '@/app/domain/types'
import styles from './illustrations.module.css'

const BG: Record<WasteCode, string> = { paper: '#EEF1F4', pet: '#E3F0FA', aluminum: '#F1F1EE' }

/** Round product image for a waste type (screen 04). */
export function WasteIcon({ code, size = 64 }: { code: WasteCode; size?: number }) {
  return (
    <span className={styles.wasteIcon} style={{ width: size, height: size, background: BG[code] }}>
      <svg viewBox="0 0 64 64" width={size * 0.72} height={size * 0.72} aria-hidden="true">
        {code === 'paper' && (
          <g>
            <path d="M10 26l22-8 22 8-22 8Z" fill="#E8B77D" />
            <path d="M10 26v22l22 8V34Z" fill="#D9A066" />
            <path d="M54 26v22l-22 8V34Z" fill="#C88D52" />
            <path d="M10 26l-4 8 22 8 4-8Z" fill="#E2AC6F" />
            <path d="M54 26l4 8-22 8-4-8Z" fill="#D49B5F" />
            <path d="M24 29l16-6" stroke="#F2D3A8" strokeWidth="3" />
          </g>
        )}
        {code === 'pet' && (
          <g>
            <rect x="26" y="4" width="12" height="7" rx="2" fill="#2F80C9" />
            <path d="M27 11h10l2 7c5 3 7 7 7 12v26a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5V30c0-5 2-9 7-12Z" fill="#CBE6F7" stroke="#8CC3E6" strokeWidth="1.5" />
            <rect x="19" y="32" width="26" height="10" fill="#9BD0EF" />
            <path d="M24 22v30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          </g>
        )}
        {code === 'aluminum' && (
          <g>
            <defs>
              <linearGradient id="can" x1="0" x2="1">
                <stop offset="0" stopColor="#B9811F" />
                <stop offset="0.45" stopColor="#F0C25A" />
                <stop offset="1" stopColor="#A87018" />
              </linearGradient>
            </defs>
            <rect x="18" y="10" width="28" height="46" rx="5" fill="url(#can)" />
            <ellipse cx="32" cy="10" rx="14" ry="4" fill="#D9D9D9" stroke="#B5B5B5" />
            <ellipse cx="32" cy="56" rx="14" ry="3.5" fill="#9A6A18" />
            <rect x="18" y="24" width="28" height="14" fill="#E8B547" opacity="0.6" />
          </g>
        )}
      </svg>
    </span>
  )
}
