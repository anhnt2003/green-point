import type { ReactNode } from 'react'
import styles from './ui.module.css'

interface StatCardProps {
  label: string
  value: ReactNode
  unit?: string
  icon?: ReactNode
  tone?: 'default' | 'primary'
}

/** Surface card: caption label, stat number, illustration bottom-right. */
export function StatCard({ label, value, unit, icon, tone = 'default' }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} ${tone === 'primary' ? styles.statValuePrimary : ''}`}>
        {value}
        {unit && <small className={styles.statUnit}> {unit}</small>}
      </span>
      {icon && <span className={styles.statIcon}>{icon}</span>}
    </div>
  )
}
