import { Logo } from './Logo'
import styles from './illustrations.module.css'

const TREES = [
  [10, 92, 20, '#2F7D3A'], [40, 84, 22, '#3E8F45'], [70, 90, 20, '#2A6E35'], [100, 82, 24, '#4FA052'],
  [132, 90, 20, '#3E8F45'], [160, 80, 22, '#2F7D3A'], [190, 88, 22, '#5DAA5F'], [220, 78, 24, '#3E8F45'],
  [252, 86, 22, '#2A6E35'], [282, 80, 22, '#4FA052'], [312, 88, 22, '#2F7D3A'], [342, 82, 24, '#3E8F45'],
  [24, 112, 22, '#4FA052'], [58, 108, 24, '#2F7D3A'], [92, 114, 22, '#5DAA5F'], [126, 106, 24, '#2A6E35'],
  [160, 112, 22, '#4FA052'], [194, 108, 24, '#2F7D3A'], [228, 112, 22, '#3E8F45'], [262, 106, 24, '#5DAA5F'],
  [296, 112, 22, '#2A6E35'], [330, 108, 24, '#4FA052'],
] as const

/** Forest-and-city banner with overlaid text (screen 07). */
export function ImpactBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className={styles.impactBanner}>
      <svg viewBox="0 0 358 120" preserveAspectRatio="xMidYMid slice" className={styles.fill} aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#DDEBEE" />
            <stop offset="1" stopColor="#F1F6F0" />
          </linearGradient>
          <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0E3B25" stopOpacity="0.7" />
            <stop offset="0.7" stopColor="#0E3B25" stopOpacity="0.15" />
            <stop offset="1" stopColor="#0E3B25" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="358" height="120" fill="url(#sky)" />
        {[
          [232, 34, 14, 40], [250, 22, 16, 52], [270, 40, 12, 34], [286, 12, 18, 62], [308, 30, 14, 44], [326, 18, 16, 56],
        ].map(([x, y, w, h]) => (
          <rect key={x} x={x} y={y + 10} width={w} height={h} fill="#B7C9D1" opacity="0.55" />
        ))}
        {TREES.map(([cx, cy, r, fill]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={fill} />
        ))}
        <rect width="358" height="120" fill="url(#shade)" />
      </svg>
      <div className={styles.impactText}>
        <span>{title}</span>
        <span>{subtitle}</span>
      </div>
      <Logo size={36} tone="light" className={styles.impactLogo} />
    </div>
  )
}
