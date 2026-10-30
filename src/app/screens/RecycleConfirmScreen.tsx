import { Check, Clock } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { formatPoints } from '@/app/domain/format'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useTransaction } from '@/app/store/selectors'
import common from './common.module.css'
import styles from './RecycleScreens.module.css'

/** Screen 05 — Xác nhận giao dịch: QR for staff, then "Đã xác nhận" once confirmed (BR-04). */
export function RecycleConfirmScreen() {
  const { code } = useParams()
  const navigate = useNavigate()
  const tx = useTransaction(code)
  const goHome = () => navigate('/', { replace: true })

  if (!tx) {
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

  const confirmed = tx.status === 'confirmed'

  return (
    <Screen header={<AppHeader title="Xác nhận giao dịch" />}>
      <div className={common.content}>
        <Card tone="tint" radius="lg" className={styles.qrCard}>
          <div className={styles.qrBox}>
            <QRCodeSVG value={`GREENPOINT:${tx.code}`} size={164} level="M" fgColor="#111111" />
          </div>
          <span className={styles.codeLabel}>Mã giao dịch</span>
          <span className={styles.code}>#{tx.code}</span>
        </Card>

        <Card className={styles.statusCard} radius="lg">
          <div className={styles.statusHead}>
            <span className={`${styles.statusIcon} ${confirmed ? styles.statusIconDone : styles.statusIconPending}`}>
              {confirmed ? <Check size={24} strokeWidth={3} /> : <Clock size={22} strokeWidth={2.4} />}
            </span>
            <div className={styles.statusText}>
              <span className={styles.statusTitle}>{confirmed ? 'Đã xác nhận' : 'Đang chờ xác nhận'}</span>
              <span className={styles.statusDesc}>
                {confirmed
                  ? 'Giao dịch của bạn đã được ghi nhận.'
                  : 'Đưa mã QR cho nhân viên điểm thu gom để cân và xác nhận.'}
              </span>
            </div>
          </div>
          <span className={`${styles.statusPoints} ${confirmed ? '' : styles.statusPointsPending}`} aria-live="polite">
            {formatPoints(tx.points, true)}
            {!confirmed && <small> dự kiến</small>}
          </span>
        </Card>

        <Button onClick={goHome}>Quay lại trang chủ</Button>
      </div>
    </Screen>
  )
}
