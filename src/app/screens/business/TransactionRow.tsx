import { Recycle } from 'lucide-react'
import { ListRow } from '@/app/components/ListRow'
import { formatDateTime, formatKg, formatPoints } from '@/app/domain/format'
import { totalWeight } from '@/app/domain/points'
import type { Transaction } from '@/app/domain/types'
import { useUser } from '@/app/store/selectors'
import styles from './Receiving.module.css'

/** A handover at the collection point, as seen by the staff. Tapping opens the weighing screen. */
export function TransactionRow({ tx, onOpen }: { tx: Transaction; onOpen(code: string): void }) {
  const citizen = useUser(tx.userId)
  const kg = formatKg(totalWeight(tx.items ?? []))
  const value =
    tx.status === 'pending' ? 'Cân' : tx.status === 'confirmed' ? formatPoints(tx.points, true) : 'Từ chối'
  return (
    <button type="button" className={`${styles.rowButton} pressable`} onClick={() => tx.code && onOpen(tx.code)}>
      <ListRow
        icon={<Recycle size={24} strokeWidth={2.2} />}
        title={`#${tx.code} · ${citizen?.name ?? 'Người dân'}`}
        subtitle={`${tx.status === 'pending' ? 'Dự kiến ' : ''}${kg} · ${formatDateTime(tx.confirmedAt ?? tx.createdAt)}`}
        value={value}
        valueTone={tx.status === 'confirmed' ? 'positive' : tx.status === 'rejected' ? 'negative' : 'muted'}
      />
    </button>
  )
}
