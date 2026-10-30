import type { ReactNode } from 'react'
import styles from './ui.module.css'

interface ActionTileProps {
  icon: ReactNode
  title: string
  subtitle: string
  onClick(): void
}

/** Home 2×2 shortcut: primary icon on the left, title + caption. */
export function ActionTile({ icon, title, subtitle, onClick }: ActionTileProps) {
  return (
    <button type="button" className={`${styles.actionTile} pressable`} onClick={onClick}>
      <span className={styles.actionIcon}>{icon}</span>
      <span className={styles.actionText}>
        <span className={styles.actionTitle}>{title}</span>
        <span className={styles.actionSubtitle}>{subtitle}</span>
      </span>
    </button>
  )
}
