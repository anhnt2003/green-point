import { Ticket } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { FilterChips, type ChipOption } from '@/app/components/FilterChips'
import { RewardThumb } from '@/app/components/illustrations/RewardThumb'
import { REWARDS } from '@/app/data/seed'
import { formatInt, formatPoints } from '@/app/domain/format'
import type { Reward, RewardCategory } from '@/app/domain/types'
import { openDialog, toast } from '@/app/feedback/useFeedback'
import { AppHeader, HeaderAction } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useCitizenStats } from '@/app/store/selectors'
import { useStore } from '@/app/store/useStore'
import common from './common.module.css'
import styles from './RewardsScreen.module.css'

type Filter = 'all' | RewardCategory

const FILTERS: readonly ChipOption<Filter>[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'green_item', label: 'Vật phẩm xanh' },
  { value: 'voucher', label: 'Voucher' },
  { value: 'plant', label: 'Cây xanh' },
]

/** Screen 06 — Đổi quà (GreenRewards). */
export function RewardsScreen() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const { pointBalance } = useCitizenStats()
  const redeem = useStore((s) => s.redeem)
  const rewards = REWARDS.filter((r) => filter === 'all' || r.category === filter)

  const onRedeem = async (reward: Reward) => {
    // BR-05: cannot redeem without enough points.
    if (pointBalance < reward.points) {
      await openDialog({
        title: 'Chưa đủ điểm',
        message: `Bạn cần thêm ${formatPoints(reward.points - pointBalance)} để đổi “${reward.name}”. Hãy bàn giao thêm rác tái chế nhé!`,
        actions: [{ label: 'Đã hiểu', value: 'ok', role: 'primary' }],
      })
      return
    }
    const choice = await openDialog({
      title: `Đổi ${reward.name}?`,
      message: `Dùng ${formatPoints(reward.points)}. Số dư sau khi đổi: ${formatPoints(pointBalance - reward.points)}.`,
      actions: [
        { label: 'Huỷ', value: 'cancel', role: 'cancel' },
        { label: 'Đổi quà', value: 'confirm', role: 'primary' },
      ],
    })
    if (choice !== 'confirm') return
    const res = redeem(reward)
    if (!res.ok) {
      toast('Không thể đổi quà. Vui lòng thử lại.', 'error')
      return
    }
    const next = await openDialog({
      title: 'Đổi quà thành công!',
      message: `Còn ${formatPoints(pointBalance - reward.points)}. ${
        reward.category === 'voucher' ? 'Mã voucher' : 'Mã nhận quà'
      } đã được lưu trong Quà của tôi.`,
      actions: [
        { label: 'Để sau', value: 'later', role: 'cancel' },
        { label: 'Xem mã', value: 'show', role: 'primary' },
      ],
    })
    if (next === 'show') navigate(`/my-rewards/${res.transactionId}`)
  }

  return (
    <Screen
      header={
        <AppHeader
          title="Đổi quà"
          align="left"
          backIcon="arrow"
          right={
            <HeaderAction label="Quà của tôi" onClick={() => navigate('/my-rewards')}>
              <Ticket size={22} strokeWidth={2} />
            </HeaderAction>
          }
        />
      }
    >
      <div className={common.content}>
        <FilterChips options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Lọc quà" />
        <ul className={styles.list}>
          {rewards.map((reward) => (
            <li key={reward.id} className={styles.item}>
              <RewardThumb kind={reward.thumb} size={80} />
              <div className={styles.info}>
                <span className={styles.name}>{reward.name}</span>
                <span className={styles.points}>{formatInt(reward.points)} điểm</span>
              </div>
              <Button size="sm" className={styles.redeem} onClick={() => onRedeem(reward)}>
                Đổi quà
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  )
}
