import { Recycle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ListRow } from '@/app/components/ListRow'
import { SectionTitle } from '@/app/components/SectionTitle'
import { formatDateTime, formatKg } from '@/app/domain/format'
import { totalWeight } from '@/app/domain/points'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useCurrentUser } from '@/app/store/selectors'
import { useStore } from '@/app/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import common from '../common.module.css'
import { WAREHOUSE_TILES } from './BusinessHomeScreen'
import styles from './Business.module.css'

/** Business "Quản lý" tab — not in the mockup. Shows warehouse shortcuts and received handovers. */
export function ManageScreen() {
  const navigate = useNavigate()
  const pointId = useCurrentUser()?.collectionPointId
  const received = useStore(
    useShallow((s) =>
      s.transactions.filter((t) => t.type === 'recycle' && t.collectionPointId === pointId && t.items?.length),
    ),
  )

  return (
    <Screen header={<AppHeader title="Quản lý" align="left" showBack={false} />}>
      <div className={common.content}>
        <div className={styles.tiles}>
          {WAREHOUSE_TILES.map(({ label, to, Icon }) => (
            <button key={to} type="button" className={`${styles.tile} pressable`} onClick={() => navigate(to)}>
              <Icon size={28} strokeWidth={2.2} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className={styles.section}>
          <SectionTitle>Giao nhận gần đây</SectionTitle>
        </div>
        {received.length === 0 ? (
          <div className={common.empty}>
            Chưa có giao dịch bàn giao từ ứng dụng. Đăng nhập tài khoản người dân và đổi rác để thấy dữ liệu ở đây.
          </div>
        ) : (
          <div className={styles.list}>
            {received.map((t) => (
              <ListRow
                key={t.id}
                icon={<Recycle size={24} strokeWidth={2.2} />}
                title={`#${t.code} · ${formatKg(totalWeight(t.items ?? []))}`}
                subtitle={formatDateTime(t.createdAt)}
                value={t.status === 'confirmed' ? 'Đã nhận' : 'Chờ cân'}
                valueTone={t.status === 'confirmed' ? 'positive' : 'muted'}
              />
            ))}
          </div>
        )}
      </div>
    </Screen>
  )
}
