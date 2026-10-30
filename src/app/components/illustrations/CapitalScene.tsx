function CoinStack({ cx, base, count }: { cx: number; base: number; count: number }) {
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const y = base - i * 7
        return (
          <g key={i}>
            <rect x={cx - 18} y={y - 7} width="36" height="7" fill="#D4A233" />
            <ellipse cx={cx} cy={y} rx="18" ry="5" fill="#C99629" />
            <ellipse cx={cx} cy={y - 7} rx="18" ry="5" fill="#ECC651" stroke="#C99629" strokeWidth="0.8" />
          </g>
        )
      })}
    </g>
  )
}

/** GreenCapital illustration: coin stacks, a sprout and a bank on a grassy base. */
export function CapitalScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 358 140" className={className} aria-hidden="true">
      <ellipse cx="80" cy="96" rx="70" ry="26" fill="#CFE8D3" />
      <ellipse cx="290" cy="92" rx="72" ry="28" fill="#CFE8D3" />
      <ellipse cx="179" cy="122" rx="150" ry="14" fill="#5FAE62" />
      <ellipse cx="179" cy="118" rx="142" ry="10" fill="#7CC27E" />

      <CoinStack cx={98} base={120} count={4} />
      <CoinStack cx={138} base={120} count={9} />
      <CoinStack cx={176} base={120} count={6} />
      <CoinStack cx={208} base={120} count={2} />

      {/* sprout on the tallest stack */}
      <path d="M138 58C138 44 139 34 141 24" stroke="#3E8E45" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M140 30C126 30 114 20 112 6c16-1 27 9 28 24Z" fill="#4CA557" />
      <path d="M141 26c4-14 16-22 32-20-2 15-15 23-32 20Z" fill="#6CC074" />

      {/* bank */}
      <g transform="translate(236 30)">
        <path d="M0 30L44 6 88 30Z" fill="#1F7A45" />
        <rect x="2" y="30" width="84" height="8" fill="#268A4E" />
        {[8, 26, 54, 72].map((x) => (
          <rect key={x} x={x} y="40" width="8" height="40" fill="#2E9658" />
        ))}
        <rect x="34" y="44" width="20" height="36" rx="10" fill="#E8C14B" />
        <rect x="41" y="54" width="6" height="14" rx="2" fill="#FFF3C4" />
        <rect x="-2" y="80" width="92" height="8" fill="#1F7A45" />
        <rect x="-6" y="88" width="100" height="6" fill="#196A3B" />
      </g>
    </svg>
  )
}
