import { Check, Clock, Info, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { formatPoints } from '@/app/domain/format'
import { qrPayload } from '@/app/domain/qr'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { isEmbedded } from '@/app/platform/PlatformContext'
import { useTransaction } from '@/app/store/selectors'
import common from './common.module.css'
import styles from './RecycleScreens.module.css'

const STATUS = {
  pending: {
    title: 'Đang chờ xác nhận',
    Icon: Clock,
    iconClass: styles.statusIconPending,
  },
  confirmed: {
    title: 'Đã xác nhận',
    Icon: Check,
    iconClass: styles.statusIconDone,
  },
  rejected: {
    title: 'Bị từ chối',
    Icon: X,
    iconClass: styles.statusIconRejected,
  },
} as const

/** Screen 05 — Xác nhận giao dịch: QR for the staff, then the result of the weighing (BR-04, F-07). */
export function RecycleConfirmScreen() {
  const { code } = useParams()
  const navigate = useNavigate()
  const tx = useTransaction(code)
  const goHome = () => navigate('/', { replace: true })

  if (!tx?.code) {
    return (
      <Screen header={<AppHeader title="Xác nhận giao dịch" />}>
        <div className={common.empty}>
          <p>Không tìm thấy giao dịch {code}.</p>
          <Button size="md" onClick={goHome}>
            Quay lại trang chủ
          </Button>
        </div>
      </Screen>
    )
  }

  const { title, Icon, iconClass } = STATUS[tx.status]
  const description =
    tx.status === 'pending'
      ? 'Đưa mã QR cho nhân viên điểm thu gom để cân và xác nhận.'
      : tx.status === 'confirmed'
        ? 'Giao dịch của bạn đã được ghi nhận.'
        : `Lý do: ${tx.rejectReason ?? 'không rõ'}. Bạn có thể phân loại lại và tạo giao dịch mới.`
  const weighedDifferently =
    tx.status === 'confirmed' && tx.estimatedPoints !== undefined && tx.estimatedPoints !== tx.points

  return (
    <Screen header={<AppHeader title="Xác nhận giao dịch" />}>
      <div className={common.content}>
        <Card tone="tint" radius="lg" className={styles.qrCard}>
          <div className={`${styles.qrBox} ${tx.status !== 'pending' ? styles.qrUsed : ''}`}>
            <QRCodeSVG value={qrPayload(tx.code)} size={164} level="M" fgColor="#111111" />
          </div>
          <span className={styles.codeLabel}>Mã giao dịch</span>
          <span className={styles.code}>#{tx.code}</span>
        </Card>

        <Card className={styles.statusCard} radius="lg">
          <div className={styles.statusHead}>
            <span className={`${styles.statusIcon} ${iconClass}`}>
              <Icon size={tx.status === 'pending' ? 22 : 24} strokeWidth={tx.status === 'pending' ? 2.4 : 3} />
            </span>
            <div className={styles.statusText}>
              <span className={styles.statusTitle}>{title}</span>
              <span className={styles.statusDesc}>{description}</span>
            </div>
          </div>
          <span
            className={`${styles.statusPoints} ${tx.status !== 'confirmed' ? styles.statusPointsPending : ''}`}
            aria-live="polite"
          >
            {formatPoints(tx.status === 'rejected' ? 0 : tx.points, tx.status !== 'rejected')}
            {tx.status === 'pending' && <small> dự kiến</small>}
          </span>
          {weighedDifferently && (
            <span className={styles.statusNote}>
              Theo số cân thực tế · dự kiến {formatPoints(tx.estimatedPoints ?? 0)}
            </span>
          )}
        </Card>

        {tx.status === 'pending' && isEmbedded() && (
          <p className={styles.simHint}>
            <Info size={16} />
            <span>
              Trong simulator: chọn <b>Điểm thu gom</b> trên thanh công cụ, vào tab <b>Quản lý</b> rồi{' '}
              <b>Quét mã nhận rác</b> để cân và xác nhận giao dịch này.
            </span>
          </p>
        )}

        <Button onClick={goHome}>Quay lại trang chủ</Button>
      </div>
    </Screen>
  )
}
