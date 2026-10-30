import { LogOut, MapPin } from 'lucide-react'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { COLLECTION_POINTS } from '@/app/data/seed'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useCurrentUser } from '@/app/store/selectors'
import { useStore } from '@/app/store/useStore'
import common from '../common.module.css'
import { ProfileHeader, confirmLogout } from '../ProfileScreen'
import styles from './Business.module.css'

/** Business "Cá nhân" tab — not in the mockup; operator info and logout. */
export function BusinessProfileScreen() {
  const user = useCurrentUser()
  const logout = useStore((s) => s.logout)
  const point = COLLECTION_POINTS.find((p) => p.id === user?.collectionPointId)

  return (
    <Screen header={<AppHeader title="Cá nhân" align="left" showBack={false} />}>
      <div className={common.content}>
        <ProfileHeader initials={user?.avatarInitials ?? ''} name={point?.name ?? user?.name ?? ''} username={user?.username ?? ''} />
        {point && (
          <Card className={styles.pointInfo}>
            <MapPin size={20} className={styles.pointInfoIcon} />
            <div>
              <p>{point.address}</p>
              <p className={common.caption}>Mở cửa: {point.openHours}</p>
            </div>
          </Card>
        )}
        <Button variant="danger" icon={<LogOut size={18} />} onClick={() => confirmLogout(logout)}>
          Đăng xuất
        </Button>
      </div>
    </Screen>
  )
}
