import { CameraOff, Keyboard, RotateCcw, ScanQrCode } from 'lucide-react'
import { useCallback, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { SectionTitle } from '@/app/components/SectionTitle'
import { TextField } from '@/app/components/TextField'
import { COLLECTION_POINTS } from '@/app/data/seed'
import { parseTransactionCode } from '@/app/domain/qr'
import { toast } from '@/app/feedback/useFeedback'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useQrScanner, type CameraStatus } from '@/app/scan/useQrScanner'
import { useCurrentUser, usePointTransactions } from '@/app/store/selectors'
import { useStore } from '@/app/store/useStore'
import common from '../common.module.css'
import { TransactionRow } from './TransactionRow'
import styles from './Receiving.module.css'

const JUST_HANDLED_MS = 10_000

const CAMERA_MESSAGE: Record<Exclude<CameraStatus, 'scanning'>, string> = {
  starting: 'Đang mở camera…',
  denied: 'Chưa có quyền dùng camera. Hãy cho phép trong cài đặt trình duyệt, hoặc nhập mã bên dưới.',
  unavailable: 'Không mở được camera trên thiết bị này. Hãy nhập mã giao dịch bên dưới.',
}

/** F-07 step 1 — the staff scans the QR on the citizen's screen 05, or types the code. */
export function ScanScreen() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [manual, setManual] = useState('')
  const [manualError, setManualError] = useState<string | null>(null)
  const pending = usePointTransactions('pending')
  // Codes already reported as handled during this scanning session (the QR may stay in view).
  const reportedRef = useRef(new Set<string>())
  const point = COLLECTION_POINTS.find((p) => p.id === useCurrentUser()?.collectionPointId)

  const open = useCallback(
    (code: string) => navigate(`/business/receive/${code}`, { state: { transition: 'push' } }),
    [navigate],
  )

  const onScan = useCallback(
    (text: string) => {
      const code = parseTransactionCode(text)
      if (!code) {
        toast('Mã QR này không phải giao dịch GreenPoint', 'error')
        return
      }
      const tx = useStore.getState().transactions.find((t) => t.code === code)
      if (!tx) {
        // No backend: transactions only exist on the device where they were created.
        toast(`Không tìm thấy giao dịch #${code} trên thiết bị này`, 'error')
        return
      }
      if (tx.status !== 'pending') {
        // Right after weighing, the citizen's QR is usually still in front of the camera:
        // stay quiet so the "Đã cộng … điểm" message stays readable.
        const handledAgo = Date.now() - new Date(tx.confirmedAt ?? tx.createdAt).getTime()
        if (handledAgo < JUST_HANDLED_MS) return
        if (!reportedRef.current.has(code)) {
          reportedRef.current.add(code)
          toast(`#${code} đã được ${tx.status === 'confirmed' ? 'xác nhận' : 'từ chối'} trước đó`, 'info')
        }
        return
      }
      navigator.vibrate?.(60)
      open(code)
    },
    [open],
  )

  const { status, retry } = useQrScanner(videoRef, onScan)

  const submitManual = (e: FormEvent) => {
    e.preventDefault()
    const code = parseTransactionCode(manual)
    if (!code) {
      setManualError('Mã gồm GP và 6 chữ số, ví dụ GP256789')
      return
    }
    if (!useStore.getState().transactions.some((t) => t.code === code)) {
      setManualError(`Không tìm thấy giao dịch #${code}`)
      return
    }
    open(code)
  }

  return (
    <Screen header={<AppHeader title="Quét mã nhận rác" fallback="/business/manage" />}>
      <div className={common.content}>
        <div className={styles.viewfinder}>
          <video ref={videoRef} className={styles.video} muted playsInline aria-label="Camera quét mã" />
          {status === 'scanning' ? (
            <div className={styles.frame} aria-hidden="true">
              <span className={styles.scanLine} />
            </div>
          ) : (
            <div className={styles.cameraMessage} role="status">
              {status === 'starting' ? <ScanQrCode size={36} /> : <CameraOff size={36} />}
              <span>{CAMERA_MESSAGE[status]}</span>
              {status !== 'starting' && (
                <Button size="md" variant="white" block={false} icon={<RotateCcw size={16} />} onClick={retry}>
                  Thử lại
                </Button>
              )}
            </div>
          )}
        </div>
        <p className={`${common.caption} ${styles.center}`}>Đưa mã QR trên app của người dân vào khung để quét.</p>

        <form className={styles.manual} onSubmit={submitManual} noValidate>
          <TextField
            label="Hoặc nhập mã giao dịch"
            placeholder="GP256789"
            autoCapitalize="characters"
            autoComplete="off"
            value={manual}
            invalid={!!manualError}
            leading={<Keyboard size={20} />}
            onChange={(e) => {
              setManual(e.target.value)
              setManualError(null)
            }}
          />
          <Button type="submit" size="md" block={false} className={styles.manualButton} disabled={!manual.trim()}>
            Mở
          </Button>
        </form>
        {manualError && (
          <p className={styles.error} role="alert">
            {manualError}
          </p>
        )}

        <div className={styles.section}>
          <SectionTitle>
            Đang chờ cân{point ? ` tại ${point.name.replace('Điểm thu gom ', '')}` : ''} ({pending.length})
          </SectionTitle>
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
      </div>
    </Screen>
  )
}
