import type { RewardThumbKind } from '@/app/domain/types'
import styles from './illustrations.module.css'

const BG: Record<RewardThumbKind, string> = {
  bottle: 'linear-gradient(160deg, #EFE6DC, #E2D5C8)',
  bag: 'linear-gradient(160deg, #EFE2D8, #E3D1C4)',
  voucher: 'linear-gradient(160deg, #EFE7DE, #E3D6CA)',
  plant: 'linear-gradient(160deg, #EEF2EA, #DFE7DA)',
}

/** Product photo stand-in for a reward (screen 06). */
export function RewardThumb({ kind, size = 80 }: { kind: RewardThumbKind; size?: number }) {
  return (
    <span className={styles.rewardThumb} style={{ width: size, height: size, background: BG[kind] }}>
      <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
        <ellipse cx="40" cy="72" rx="22" ry="3" fill="#000" opacity="0.08" />
        {kind === 'bottle' && (
          <g>
            <path d="M33 8h14v6H33Z" fill="#2B2B2B" />
            <path d="M47 9c6 0 6 8 0 8" stroke="#2B2B2B" strokeWidth="2" fill="none" />
            <path d="M32 14h16v6c4 2 6 5 6 9v36a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6V29c0-4 2-7 6-9Z" fill="#4C8B4F" />
            <path d="M31 28v34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
          </g>
        )}
        {kind === 'bag' && (
          <g>
            <path d="M30 28c0-14 20-14 20 0" stroke="#E2D7C6" strokeWidth="3" fill="none" />
            <path d="M22 28h36l3 42H19Z" fill="#F6F1E8" />
            <path d="M22 28h36l1 6H21Z" fill="#ECE4D6" />
          </g>
        )}
        {kind === 'voucher' && (
          <g>
            <rect x="8" y="20" width="64" height="42" rx="5" fill="#C9302C" />
            <rect x="13" y="25" width="18" height="10" rx="3" fill="#FFFFFF" opacity="0.9" />
            <path d="M38 38h14l-2 18H40Z" fill="#F4E9DC" />
            <path d="M54 36h13l-2 20H56Z" fill="#3A2418" />
            <ellipse cx="45" cy="38" rx="7" ry="2" fill="#7A4B2E" />
            <ellipse cx="60.5" cy="36" rx="6.5" ry="2" fill="#5B3A29" />
            <rect x="13" y="48" width="20" height="3" rx="1.5" fill="#FFFFFF" opacity="0.7" />
            <rect x="13" y="54" width="14" height="3" rx="1.5" fill="#FFFFFF" opacity="0.5" />
          </g>
        )}
        {kind === 'plant' && (
          <g>
            <path d="M40 46C36 34 30 24 18 18c4 14 12 24 22 28Z" fill="#3E8E45" />
            <path d="M40 46c4-14 10-26 24-32-2 16-12 28-24 32Z" fill="#4FA052" />
            <path d="M40 46c-2-14 0-28 6-38 6 12 4 28-6 38Z" fill="#5DB866" />
            <path d="M40 46c-6-8-16-12-28-10 6 8 16 12 28 10Z" fill="#4FA052" />
            <path d="M26 46h28l-3 24H29Z" fill="#CFCBC4" />
            <rect x="24" y="44" width="32" height="6" rx="2" fill="#BDB8B0" />
          </g>
        )}
      </svg>
    </span>
  )
}
