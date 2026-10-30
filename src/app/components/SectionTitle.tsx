import type { ReactNode } from 'react'
import styles from './ui.module.css'

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className={styles.sectionTitle}>{children}</h2>
}
