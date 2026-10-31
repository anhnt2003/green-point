import { ChevronRight, MapPin, Store } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { RewardThumb } from '@/app/components/illustrations/RewardThumb'
import { COLLECTION_POINTS, DEFAULT_COLLECTION_POINT_ID, REWARDS } from '@/app/data/seed'
import { formatDateTime } from '@/app/domain/format'
import { rewardQrPayload } from '@/app/domain/qr'
import { isVoucher } from '@/app/domain/rewards'
import type { Reward, Transaction } from '@/app/domain/types'
import { openDialog } from '@/app/feedback/useFeedback'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useMyRewards } from '@/app/store/selectors'
import { useStore } from '@/app/store/useStore'
import common from './common.module.css'
import recycle from './RecycleScreens.module.css'
import styles from './MyRewardsScreen.module.css'

const rewardOf = (tx: Transaction) => REWARDS.find((r) => r.id === tx.rewardId)

function statusLabel(reward: Reward, used: boolean) {
  if (isVoucher(reward)) return used ? 'Đã dùng' : 'Chưa dùng'
  return used ? 'Đã nhận' : 'Chưa nhận'
}

/** Rewards the citizen redeemed, with their codes (GreenRewards). */
export function MyRewardsScreen() {
  const navigate = useNavigate()
  const rewards = useMyRewards()

  return (
    <Screen header={<AppHeader title="Quà của tôi" align="left" fallback="/rewards" />}>
      <div className={common.content}>
        {rewards.length === 0 ? (
          <div className={common.empty}>
            <p>Bạn chưa đổi quà nào.</p>
            <Button size="md" block={false} onClick={() => navigate('/rewards')}>
              Đổi quà
            </Button>
          </div>
        ) : (
          <ul className={styles.list}>
            {rewards.map((tx) => {
              const reward = rewardOf(tx)
              if (!reward) return null
              return (
                <li key={tx.id}>
                  <button type="button" className={`${styles.item} pressable`} onClick={() => navigate(`/my-rewards/${tx.id}`)}>
                    <RewardThumb kind={reward.thumb} size={56} />
                    <span className={styles.text}>
                      <span className={styles.name}>{reward.name}</span>
                      <span className={common.caption}>
                        {tx.rewardCode} · {formatDateTime(tx.createdAt)}
                      </span>
                    </span>
                    <span className={`${styles.badge} ${tx.usedAt ? styles.badgeUsed : ''}`}>
                      {statusLabel(reward, !!tx.usedAt)}
                    </span>
                    <ChevronRight size={18} className={styles.chevron} />
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

/** One redeemed reward: the code to show, where to use it, and marking it used. */
export function MyRewardScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const tx = useMyRewards().find((t) => t.id === id)
  const reward = tx && rewardOf(tx)
  const markUsed = useStore((s) => s.markRewardUsed)

  if (!tx?.rewardCode || !reward) {
    return (
      <Screen header={<AppHeader title="Quà của tôi" fallback="/my-rewards" />}>
        <div className={common.empty}>
          <p>Không tìm thấy quà này.</p>
          <Button size="md" block={false} onClick={() => navigate('/my-rewards', { replace: true })}>
            Xem quà của tôi
          </Button>
        </div>
      </Screen>
    )
  }

  const voucher = isVoucher(reward)
  const point = COLLECTION_POINTS.find((p) => p.id === DEFAULT_COLLECTION_POINT_ID)
  const used = !!tx.usedAt

  const confirmUsed = async () => {
    const choice = await openDialog({
      title: voucher ? 'Đánh dấu đã dùng voucher?' : 'Xác nhận đã nhận quà?',
      message: 'Mã sẽ không dùng lại được nữa.',
      actions: [
        { label: 'Huỷ', value: 'cancel', role: 'cancel' },
        { label: voucher ? 'Đã dùng' : 'Đã nhận', value: 'ok', role: 'primary' },
      ],
    })
    if (choice === 'ok') markUsed(tx.id)
  }

  return (
    <Screen header={<AppHeader title={reward.name} align="left" fallback="/my-rewards" />}>
      <div className={common.content}>
        <Card tone="tint" radius="lg" className={recycle.qrCard}>
          <div className={`${recycle.qrBox} ${used ? recycle.qrUsed : ''}`}>
            <QRCodeSVG value={rewardQrPayload(tx.rewardCode)} size={164} level="M" fgColor="#111111" />
          </div>
          <span className={recycle.codeLabel}>{voucher ? 'Mã voucher' : 'Mã nhận quà'}</span>
          <span className={recycle.code}>{tx.rewardCode}</span>
          <span className={`${styles.badge} ${used ? styles.badgeUsed : ''}`}>
            {statusLabel(reward, used)}
            {used && ` · ${formatDateTime(tx.usedAt as string)}`}
          </span>
        </Card>

        <Card radius="lg" className={styles.howTo}>
          <span className={styles.howToIcon}>{voucher ? <Store size={20} /> : <MapPin size={20} />}</span>
          <div className={styles.text}>
            <span className={styles.name}>{voucher ? `Dùng tại ${reward.partner}` : `Nhận tại ${point?.name}`}</span>
            <span className={styles.howToText}>
              {voucher
                ? `Đưa mã này cho thu ngân ${reward.partner} khi thanh toán. Mỗi mã dùng một lần.`
                : `${point?.address} · Mở cửa ${point?.openHours}. Đưa mã QR cho nhân viên để nhận quà.`}
            </span>
          </div>
        </Card>

        <p className={common.caption}>Đổi lúc {formatDateTime(tx.createdAt)}</p>

        {!used && (
          <Button variant="outline" onClick={confirmUsed}>
            {voucher ? 'Đánh dấu đã dùng' : 'Tôi đã nhận quà'}
          </Button>
        )}
      </div>
    </Screen>
  )
}
