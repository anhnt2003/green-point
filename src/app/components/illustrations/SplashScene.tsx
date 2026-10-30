import { Recycle } from 'lucide-react'

const BUILDINGS = [
  { x: 64, w: 50, h: 112, fill: '#C6DCE6', win: '#EAF4F8' },
  { x: 118, w: 44, h: 148, fill: '#AFCBD9', win: '#E3F0F6' },
  { x: 166, w: 52, h: 196, fill: '#B8D2E0', win: '#E9F3F8' },
  { x: 222, w: 44, h: 150, fill: '#E7A96A', win: '#F7DDB9' },
  { x: 270, w: 52, h: 124, fill: '#C3DAE5', win: '#EAF4F8' },
]
const GROUND = 262

const BINS = [
  { x: 51, body: '#2F8A4C', lid: '#246F3C' },
  { x: 124, body: '#3B9A56', lid: '#2C7C43' },
  { x: 197, body: '#F2C02F', lid: '#D9A61C' },
  { x: 270, body: '#3D85C8', lid: '#2F6DA8' },
]

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-6" width="6" height="34" rx="2" fill="#7A5A3C" />
      <circle cx="0" cy="-22" r="20" fill="#5FAE5E" />
      <circle cx="-13" cy="-10" r="13" fill="#4E9E51" />
      <circle cx="13" cy="-12" r="14" fill="#6BBA66" />
    </g>
  )
}

function FloatingLeaf({ x, y, size, rotate }: { x: number; y: number; size: number; rotate: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${size / 40})`}>
      <path d="M-20 10C-20-8-6-20 20-20 20 2 6 16-20 10Z" fill="#3E9B57" />
      <path d="M-18 9C-6 0 4-8 16-17" stroke="#E6F3E8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  )
}

/** Splash illustration: green city, globe, four recycling bins, floating leaves. */
export function SplashScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 390 400" className={className} preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <radialGradient id="globe" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#F5FBFD" />
          <stop offset="1" stopColor="#CBE5EE" />
        </radialGradient>
        <clipPath id="globe-clip">
          <circle cx="195" cy="372" r="168" />
        </clipPath>
        <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7CC27A" />
          <stop offset="1" stopColor="#4E9E51" />
        </linearGradient>
      </defs>

      <ellipse cx="62" cy="96" rx="46" ry="14" fill="#FFFFFF" opacity="0.8" />
      <ellipse cx="330" cy="74" rx="40" ry="12" fill="#FFFFFF" opacity="0.8" />

      {BUILDINGS.map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={GROUND - b.h} width={b.w} height={b.h} rx="3" fill={b.fill} />
          {Array.from({ length: Math.floor((b.h - 16) / 18) }).flatMap((_, row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={b.x + 7 + col * ((b.w - 14) / 3)}
                y={GROUND - b.h + 10 + row * 18}
                width={(b.w - 14) / 3 - 5}
                height="9"
                rx="1.5"
                fill={b.win}
              />
            )),
          )}
        </g>
      ))}
      {/* antenna + flag */}
      <rect x="191" y={GROUND - 222} width="2.5" height="28" fill="#9FBCCB" />
      <path d={`M244 ${GROUND - 150} l0 -26`} stroke="#B8875A" strokeWidth="2" />
      <path d={`M244 ${GROUND - 176} l16 5 -16 5Z`} fill="#F2C02F" />

      <Tree x={40} y={GROUND - 4} s={1.05} />
      <Tree x={98} y={GROUND + 10} s={0.85} />
      <Tree x={300} y={GROUND + 4} s={0.9} />
      <Tree x={352} y={GROUND - 6} s={1.1} />

      {/* globe */}
      <circle cx="195" cy="372" r="168" fill="url(#globe)" />
      <g clipPath="url(#globe-clip)" fill="#5DAA5F" opacity="0.9">
        <path d="M70 250c22-14 52-10 64 6s-4 30-24 32-20 18-38 14-22-38-2-52Z" />
        <path d="M168 232c20-8 46 0 52 16s-12 22-8 34-18 20-30 10-30-46-14-60Z" />
        <path d="M250 246c26-6 58 6 66 24s-18 18-30 30-36-8-40-24 0-28 4-30Z" />
        <path d="M120 312c14-4 30 6 28 18s-22 20-32 12-8-28 4-30Z" />
      </g>

      {/* hills */}
      <path d="M0 312C50 270 120 282 168 318L168 400H0Z" fill="url(#hill)" />
      <path d="M390 306C340 268 268 284 222 320L222 400H390Z" fill="url(#hill)" />

      {/* bins */}
      {BINS.map((bin) => (
        <g key={bin.x}>
          <rect x={bin.x} y="284" width="69" height="88" rx="6" fill={bin.body} />
          <rect x={bin.x - 4} y="274" width="77" height="14" rx="4" fill={bin.lid} />
          <rect x={bin.x + 24} y="268" width="21" height="7" rx="3" fill={bin.lid} />
          <Recycle x={bin.x + 17} y="308" width="35" height="35" color="#FFFFFF" strokeWidth={2.4} />
        </g>
      ))}

      <FloatingLeaf x={92} y={54} size={42} rotate={-12} />
      <FloatingLeaf x={318} y={38} size={34} rotate={14} />
      <FloatingLeaf x={356} y={150} size={26} rotate={-30} />

      {/* white ground that blends into the action area */}
      <ellipse cx="195" cy="430" rx="280" ry="66" fill="#FFFFFF" />
    </svg>
  )
}
