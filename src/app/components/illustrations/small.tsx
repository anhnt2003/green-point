/** Small colored icons that lucide does not cover. All decorative. */

export function BottlesIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="25" y="3" width="7" height="4" rx="1" fill="#2F8A4C" />
      <path d="M24 7h9l1 4c3 2 4 4 4 7v17a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3V18c0-3 1-5 4-7Z" fill="#6CC071" />
      <rect x="9" y="13" width="6" height="4" rx="1" fill="#2F8A4C" />
      <path d="M8 17h8l1 3c2 2 3 3 3 6v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-9c0-3 1-4 3-6Z" fill="#4CAF50" />
      <path d="M26 16v16M9 24v9" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

/** Red/yellow gift used on redeem rows (screen 08). */
export function GiftColorIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 9c-2-5-8-6-8-2s6 2 8 2Zm0 0c2-5 8-6 8-2s-6 2-8 2Z" fill="#F5B83D" />
      <rect x="4" y="9" width="24" height="7" rx="1.5" fill="#E5484D" />
      <rect x="6" y="16" width="20" height="13" rx="1.5" fill="#EF5B5F" />
      <rect x="14" y="9" width="4" height="20" fill="#F5B83D" />
    </svg>
  )
}

/** Clock with counter-clockwise arrow (lucide's former "history" icon). */
export function HistoryIcon({
  size = 24,
  strokeWidth = 2,
  className,
}: {
  size?: number
  strokeWidth?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

export function BottleOutlineIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2h4v3h-4z" />
      <path d="M10 5h4l1 3c2 1 3 3 3 5v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7c0-2 1-4 3-5Z" />
      <path d="M6 13h12" />
    </svg>
  )
}

export function CanOutlineIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="4.5" rx="5" ry="1.8" />
      <path d="M7 4.5v15c0 1 2.2 1.8 5 1.8s5-.8 5-1.8v-15" />
      <path d="M7 9h10M7 15h10" />
    </svg>
  )
}

/** Solid house with a door cut-out: the active iOS "Trang chủ" tab in the mockup. */
export function HouseFilledIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M3.7 8.5 10.7 2.5a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2h-4v-6.5a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 14.5V21H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .7-1.5Z"
      />
    </svg>
  )
}
