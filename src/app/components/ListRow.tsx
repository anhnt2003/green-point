import type { ReactNode } from 'react'
import styles from './ui.module.css'

interface ListRowProps {
  icon: ReactNode
  iconTone?: 'primary' | 'warm'
  title: string
  subtitle?: string
  value?: ReactNode
  valueTone?: 'positive' | 'negative' | 'muted'
}

/** Tinted round icon, title + timestamp, value on the right (green if positive, danger if negative). */
export function ListRow({ icon, iconTone = 'primary', title, subtitle, value, valueTone = 'positive' }: ListRowProps) {
  return (
    <div className={styles.listRow}>
      <span className={`${styles.listIcon} ${iconTone === 'warm' ? styles.listIconWarm : ''}`}>{icon}</span>
      <div className={styles.listText}>
        <span className={styles.listTitle}>{title}</span>
        {subtitle && <span className={styles.listSubtitle}>{subtitle}</span>}
      </div>
      {value !== undefined && <span className={`${styles.listValue} ${styles[`value_${valueTone}`]}`}>{value}</span>}
    </div>
  )
}
