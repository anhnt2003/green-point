import { BellOff, Check, Gift, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDateTime } from '@/app/domain/format'
import type { AppNotification } from '@/app/domain/notifications'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useNotifications } from '@/app/store/selectors'
import { useStore } from '@/app/store/useStore'
import common from './common.module.css'
import styles from './NotificationsScreen.module.css'

const ICON: Record<AppNotification['tone'], typeof Check> = { positive: Check, negative: X, info: Gift }

/** Bell on the home screen: handovers confirmed or rejected by the staff, rewards redeemed. */
export function NotificationsScreen() {
  const navigate = useNavigate()
  const { list, seenAt } = useNotifications()
  const markSeen = useStore((s) => s.markNotificationsSeen)
  // What was new when the screen opened stays highlighted while it is open.
  const [seenBefore] = useState(() => (seenAt ? new Date(seenAt).getTime() : 0))

  useEffect(() => {
    markSeen()
  }, [markSeen, list.length])

  return (
    <Screen header={<AppHeader title="Thông báo" align="left" />}>
      <div className={common.content}>
        {list.length === 0 ? (
          <div className={common.empty}>
            <BellOff size={32} />
            <p>Chưa có thông báo nào.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {list.map((n) => {
              const Icon = ICON[n.tone]
              const isNew = new Date(n.at).getTime() > seenBefore
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`${styles.item} ${isNew ? styles.itemNew : ''} pressable`}
                    onClick={() => n.link && navigate(n.link)}
                    disabled={!n.link}
                  >
                    <span className={`${styles.icon} ${styles[`icon_${n.tone}`]}`}>
                      <Icon size={20} strokeWidth={2.4} />
                    </span>
                    <span className={styles.text}>
                      <span className={styles.title}>
                        {n.title}
                        {isNew && <span className={styles.newDot} aria-label="Mới" />}
                      </span>
                      <span className={styles.body}>{n.body}</span>
                      <span className={common.caption}>{formatDateTime(n.at)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Screen>
  )
}
