import { Gift, Leaf, MapPin, Recycle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActionTile } from '@/app/components/ActionTile'
import { BottlesIcon } from '@/app/components/illustrations/small'
import { PointsCard } from '@/app/components/PointsCard'
import { SectionTitle } from '@/app/components/SectionTitle'
import { StatCard } from '@/app/components/StatCard'
import { formatKgValue } from '@/app/domain/format'
import { HomeHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useCitizenStats, useCurrentUser } from '@/app/store/selectors'
import common from './common.module.css'
import styles from './HomeScreen.module.css'

/** Screen 02 — Trang chủ. */
export function HomeScreen() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const stats = useCitizenStats()

  return (
    <Screen header={<HomeHeader initials={user?.avatarInitials ?? ''} onAvatar={() => navigate('/profile', { replace: true })} />}>
      <div className={common.content}>
        <div className={styles.greeting}>
          <h2 className={styles.hello}>Xin chào, {user?.name}!</h2>
          <p className={styles.sub}>Cùng nhau vì một Việt Nam xanh hơn 🌿</p>
        </div>

        <PointsCard points={stats.pointBalance} onRedeem={() => navigate('/rewards')} />

        <div className={common.row2}>
          <StatCard label="Rác đã bàn giao" value={formatKgValue(stats.totalKg)} unit="kg" icon={<BottlesIcon size={40} />} />
          <StatCard
            label="Số lần giao dịch"
            value={stats.transactionCount}
            unit="lần"
            icon={<Recycle size={38} strokeWidth={2.2} />}
          />
        </div>

        <div className={styles.section}>
          <SectionTitle>Bạn muốn làm gì hôm nay?</SectionTitle>
        </div>
        <div className={common.row2}>
          <ActionTile
            icon={<MapPin size={28} strokeWidth={2.2} fill="currentColor" stroke="#ffffff" />}
            title="Tìm điểm thu gom"
            subtitle="Gần bạn nhất"
            onClick={() => navigate('/map', { replace: true })}
          />
          <ActionTile
            icon={<Recycle size={28} strokeWidth={2.2} />}
            title="Đổi rác lấy điểm"
            subtitle="Quy trình đơn giản"
            onClick={() => navigate('/recycle')}
          />
          <ActionTile
            icon={<Gift size={28} strokeWidth={2.2} />}
            title="Đổi quà"
            subtitle="Nhiều ưu đãi hấp dẫn"
            onClick={() => navigate('/rewards')}
          />
          <ActionTile
            icon={<Leaf size={28} strokeWidth={2.2} fill="currentColor" stroke="#ffffff" />}
            title="Theo dõi tác động"
            subtitle="Vì môi trường xanh"
            onClick={() => navigate('/impact')}
          />
        </div>
      </div>
    </Screen>
  )
}
