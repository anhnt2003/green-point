import { ChevronRight, ScanQrCode } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SectionTitle } from '@/app/components/SectionTitle'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { usePointTransactions } from '@/app/store/selectors'
import common from '../common.module.css'
import { TransactionRow } from './TransactionRow'
import styles from './Receiving.module.css'

/** Business "Quản lý" tab: scan to receive waste (F-07) and the handover history (F-12). */
export function ManageScreen() {
  const navigate = useNavigate()
  const pending = usePointTransactions('pending')
  const handled = usePointTransactions('handled')
  const open = (code: string) => navigate(`/business/receive/${code}`)

  return (
    <Screen header={<AppHeader title="Quản lý" align="left" showBack={false} />}>
      <div className={common.content}>
        <button type="button" className={`${styles.scanCard} pressable`} onClick={() => navigate('/business/scan')}>
          <span className={styles.scanIcon}>
            <ScanQrCode size={28} strokeWidth={2} />
          </span>
          <span className={styles.scanText}>
            <strong>Quét mã nhận rác</strong>
            <span>Quét QR trên app người dân, cân thực tế và cộng điểm</span>
          </span>
          <ChevronRight size={22} />
        </button>

        <div className={styles.section}>
          <SectionTitle>Chờ cân ({pending.length})</SectionTitle>
        </div>
        {pending.length === 0 ? (
          <p className={`${common.caption} ${styles.emptyLine}`}>Chưa có giao dịch nào đang chờ.</p>
        ) : (
          <div className={styles.list}>
            {pending.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onOpen={open} />
            ))}
          </div>
        )}

        <div className={styles.section}>
          <SectionTitle>Đã xử lý gần đây</SectionTitle>
        </div>
        {handled.length === 0 ? (
          <p className={`${common.caption} ${styles.emptyLine}`}>
            Chưa có giao dịch nào được cân qua ứng dụng.
          </p>
        ) : (
          <div className={styles.list}>
            {handled.slice(0, 10).map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onOpen={open} />
            ))}
          </div>
        )}
      </div>
    </Screen>
  )
}
