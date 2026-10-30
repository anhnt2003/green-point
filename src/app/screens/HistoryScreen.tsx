import { Recycle } from 'lucide-react'
import { useState } from 'react'
import { FilterChips, type ChipOption } from '@/app/components/FilterChips'
import { GiftColorIcon } from '@/app/components/illustrations/small'
import { ListRow } from '@/app/components/ListRow'
import { formatDateTime, formatPoints } from '@/app/domain/format'
import type { TransactionType } from '@/app/domain/types'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useUserTransactions } from '@/app/store/selectors'
import common from './common.module.css'
import styles from './HistoryScreen.module.css'

type Filter = 'all' | TransactionType

const FILTERS: readonly ChipOption<Filter>[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'recycle', label: 'Đổi rác' },
  { value: 'redeem', label: 'Đổi quà' },
]

/** Screen 08 — Lịch sử giao dịch. Recycle = positive green, redeem = negative red (BR-07). */
export function HistoryScreen() {
  const [filter, setFilter] = useState<Filter>('all')
  const transactions = useUserTransactions()
  const rows = transactions
    .filter((t) => filter === 'all' || t.type === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <Screen header={<AppHeader title="Lịch sử giao dịch" align="left" />}>
      <div className={common.content}>
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} variant="tabs" ariaLabel="Lọc giao dịch" />
        {rows.length === 0 ? (
          <div className={common.empty}>Chưa có giao dịch nào.</div>
        ) : (
          <div className={styles.list}>
            {rows.map((t) => {
              const prefix = t.status === 'pending' ? 'Chờ xác nhận · ' : t.status === 'rejected' ? 'Bị từ chối · ' : ''
              return (
                <ListRow
                  key={t.id}
                  icon={t.type === 'recycle' ? <Recycle size={26} strokeWidth={2.2} /> : <GiftColorIcon />}
                  iconTone={t.type === 'recycle' ? 'primary' : 'warm'}
                  title={t.type === 'recycle' ? 'Đổi rác' : 'Đổi quà'}
                  subtitle={prefix + formatDateTime(t.createdAt)}
                  value={t.status === 'rejected' ? '0 điểm' : formatPoints(t.points, true)}
                  valueTone={t.status !== 'confirmed' ? 'muted' : t.points < 0 ? 'negative' : 'positive'}
                />
              )
            })}
          </div>
        )}
      </div>
    </Screen>
  )
}
