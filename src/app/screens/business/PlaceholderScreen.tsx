import type { LucideIcon } from 'lucide-react'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import common from '../common.module.css'
import styles from './Business.module.css'

/** Screens referenced by the mockup but not designed yet. */
export function PlaceholderScreen({ title, Icon }: { title: string; Icon: LucideIcon }) {
  return (
    <Screen header={<AppHeader title={title} align="left" fallback="/business" />}>
      <div className={common.empty}>
        <span className={styles.placeholderIcon}>
          <Icon size={32} strokeWidth={2} />
        </span>
        <strong className={styles.placeholderTitle}>{title}</strong>
        <p className={common.caption}>Màn hình này chưa có trong thiết kế. Sẽ bổ sung khi có mockup.</p>
      </div>
    </Screen>
  )
}
