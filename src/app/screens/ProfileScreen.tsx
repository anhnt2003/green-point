import { BookOpen, ChevronRight, Gift, Leaf, LogOut, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { HistoryIcon } from '@/app/components/illustrations/small'
import { formatInt, formatKg } from '@/app/domain/format'
import { openDialog } from '@/app/feedback/useFeedback'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useCitizenStats, useCurrentUser } from '@/app/store/selectors'
import { useStore } from '@/app/store/useStore'
import common from './common.module.css'
import styles from './ProfileScreen.module.css'

export async function confirmLogout(logout: () => void) {
  const choice = await openDialog({
    title: 'Đăng xuất?',
    message: 'Bạn có chắc muốn đăng xuất khỏi GreenPoint?',
    actions: [
      { label: 'Huỷ', value: 'cancel', role: 'cancel' },
      { label: 'Đăng xuất', value: 'logout', role: 'destructive' },
    ],
  })
  if (choice === 'logout') logout()
}

/** Citizen "Cá nhân" tab — not in the mockup; minimal screen with logout. */
export function ProfileScreen() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const stats = useCitizenStats()
  const logout = useStore((s) => s.logout)

  const links: { label: string; to: string; Icon: LucideIcon | typeof HistoryIcon }[] = [
    { label: 'Tác động của bạn', to: '/impact', Icon: Leaf },
    { label: 'Lịch sử giao dịch', to: '/history', Icon: HistoryIcon },
    { label: 'Đổi quà', to: '/rewards', Icon: Gift },
    { label: 'Hướng dẫn phân loại rác', to: '/guide', Icon: BookOpen },
  ]

  return (
    <Screen header={<AppHeader title="Cá nhân" align="left" showBack={false} />}>
      <div className={common.content}>
        <ProfileHeader initials={user?.avatarInitials ?? ''} name={user?.name ?? ''} username={user?.username ?? ''} />

        <Card tone="tint" radius="lg" className={styles.summary}>
          <div>
            <span className={common.caption}>Điểm hiện có</span>
            <strong>{formatInt(stats.pointBalance)}</strong>
          </div>
          <div>
            <span className={common.caption}>Đã bàn giao</span>
            <strong>{formatKg(stats.totalKg)}</strong>
          </div>
        </Card>

        <Card padded={false} className={styles.menu}>
          {links.map(({ label, to, Icon }) => (
            <button key={to} type="button" className={`${styles.menuItem} pressable`} onClick={() => navigate(to)}>
              <span className={styles.menuIcon}>
                <Icon size={20} />
              </span>
              <span className={styles.menuLabel}>{label}</span>
              <ChevronRight size={18} className={styles.menuChevron} />
            </button>
          ))}
        </Card>

        <Button variant="danger" icon={<LogOut size={18} />} onClick={() => confirmLogout(logout)}>
          Đăng xuất
        </Button>
      </div>
    </Screen>
  )
}

export function ProfileHeader({ initials, name, username }: { initials: string; name: string; username: string }) {
  return (
    <div className={styles.profile}>
      <span className={styles.avatar}>{initials}</span>
      <div>
        <h2 className={styles.name}>{name}</h2>
        <span className={common.caption}>@{username}</span>
      </div>
    </div>
  )
}

