import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { WasteIcon } from '@/app/components/illustrations/WasteIcon'
import { SectionTitle } from '@/app/components/SectionTitle'
import { WeightField } from '@/app/components/WeightField'
import { WASTE_TYPES } from '@/app/data/seed'
import { formatDateTime, formatKg, formatKgValue, formatPoints } from '@/app/domain/format'
import { calcPoints, parseScaleWeight } from '@/app/domain/points'
import type { Transaction, WasteCode, WasteItem } from '@/app/domain/types'
import { openDialog, toast } from '@/app/feedback/useFeedback'
import { AppHeader, useBack } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useCurrentUser, useTransaction, useUser } from '@/app/store/selectors'
import { useStore } from '@/app/store/useStore'
import common from '../common.module.css'
import styles from './Receiving.module.css'

export const REJECT_REASONS = ['Rác chưa phân loại đúng', 'Rác bẩn hoặc còn ướt', 'Không thuộc loại được nhận'] as const

const STATUS_LABEL: Record<Transaction['status'], string> = {
  pending: 'Chờ cân',
  confirmed: 'Đã xác nhận',
  rejected: 'Đã từ chối',
}

const weightOf = (items: WasteItem[] | undefined, code: WasteCode) =>
  items?.find((i) => i.code === code)?.weightKg ?? 0

/** F-07 step 2 — the staff enters the actual scale weights, then confirms or rejects. */
export function ReceiveScreen() {
  const { code } = useParams()
  const tx = useTransaction(code)
  const me = useCurrentUser()
  const citizen = useUser(tx?.userId)

  if (!tx?.code) {
    return (
      <Screen header={<AppHeader title="Cân và xác nhận" fallback="/business/scan" />}>
        <div className={common.empty}>Không tìm thấy giao dịch {code}.</div>
      </Screen>
    )
  }

  const otherPoint = tx.collectionPointId !== me?.collectionPointId
  return (
    <Screen header={<AppHeader title="Cân và xác nhận" fallback="/business/scan" />}>
      <div className={common.content}>
        <Card className={styles.who}>
          <span className={styles.avatar}>{citizen?.avatarInitials ?? '?'}</span>
          <div className={styles.whoText}>
            <strong>{citizen?.name ?? 'Người dân'}</strong>
            <span className={common.caption}>#{tx.code}</span>
            <span className={common.caption}>{formatDateTime(tx.createdAt)}</span>
          </div>
          <span className={`${styles.badge} ${styles[`badge_${tx.status}`]}`}>{STATUS_LABEL[tx.status]}</span>
        </Card>

        {otherPoint ? (
          <div className={common.empty}>Giao dịch này được tạo cho một điểm thu gom khác.</div>
        ) : tx.status === 'pending' ? (
          <WeighForm tx={tx} citizenName={citizen?.name ?? 'người dân'} />
        ) : (
          <HandledSummary tx={tx} />
        )}
      </div>
    </Screen>
  )
}

function WeighForm({ tx, citizenName }: { tx: Transaction; citizenName: string }) {
  // Back to where the staff came from: the scanner or the Quản lý list.
  const goBack = useBack('/business/scan')
  const confirmRecycle = useStore((s) => s.confirmRecycle)
  const rejectRecycle = useStore((s) => s.rejectRecycle)
  // Pre-filled with the citizen's estimate; the staff overwrites with the scale reading.
  const [text, setText] = useState<Record<WasteCode, string>>(() => {
    const entries = WASTE_TYPES.map((t) => {
      const kg = weightOf(tx.items, t.code)
      return [t.code, kg ? formatKgValue(kg) : ''] as const
    })
    return Object.fromEntries(entries) as Record<WasteCode, string>
  })

  const parsed = WASTE_TYPES.map((t) => ({ code: t.code, weightKg: parseScaleWeight(text[t.code]) }))
  const invalid = parsed.some((p) => p.weightKg === null)
  const items: WasteItem[] = parsed.map((p) => ({ code: p.code, weightKg: p.weightKg ?? 0 }))
  const points = calcPoints(items, WASTE_TYPES)
  const diff = points - tx.points

  const confirm = () => {
    const res = confirmRecycle(tx.code as string, items)
    if (!res.ok) {
      toast('Không xác nhận được giao dịch này', 'error')
      return
    }
    toast(`Đã cộng ${formatPoints(res.points)} cho ${citizenName}`)
    goBack()
  }

  const reject = async () => {
    const reason = await openDialog({
      title: 'Từ chối giao dịch?',
      message: 'Chọn lý do. Người dân sẽ thấy lý do này trong app.',
      actions: [
        ...REJECT_REASONS.map((r) => ({ label: r, value: r })),
        { label: 'Huỷ', value: 'cancel', role: 'cancel' as const },
      ],
    })
    if (reason === 'cancel') return
    const res = rejectRecycle(tx.code as string, reason)
    if (!res.ok) {
      toast('Không từ chối được giao dịch này', 'error')
      return
    }
    toast(`Đã từ chối #${tx.code}`, 'info')
    goBack()
  }

  return (
    <>
      <div className={styles.section}>
        <SectionTitle>Nhập số cân thực tế</SectionTitle>
      </div>
      <div className={styles.weighList}>
        {WASTE_TYPES.map((type) => {
          const estimate = weightOf(tx.items, type.code)
          return (
            <div key={type.code} className={styles.weighRow}>
              <WasteIcon code={type.code} size={44} />
              <div className={styles.weighText}>
                <span className={styles.weighName}>{type.name}</span>
                <span className={common.caption}>
                  {estimate ? `Dự kiến ${formatKg(estimate)}` : 'Không khai báo'} · {type.pointsPerKg} điểm/kg
                </span>
              </div>
              <WeightField
                label={`Số cân ${type.name}`}
                value={text[type.code]}
                invalid={parseScaleWeight(text[type.code]) === null}
                onChange={(v) => setText((cur) => ({ ...cur, [type.code]: v }))}
              />
            </div>
          )
        })}
      </div>
      {invalid && (
        <p className={styles.error} role="alert">
          Số cân không hợp lệ. Nhập số kg, ví dụ 2.4
        </p>
      )}

      <Card tone="tint" radius="lg" className={styles.total}>
        <span className={styles.totalLabel}>Điểm cộng cho {citizenName}</span>
        <span className={styles.totalValue} aria-live="polite">
          {formatPoints(points)}
        </span>
        <span className={common.caption}>
          Dự kiến {formatPoints(tx.points)}
          {diff !== 0 && ` · chênh lệch ${diff > 0 ? '+' : ''}${diff}`}
        </span>
      </Card>

      <div className={styles.actions}>
        <Button variant="danger" block={false} className={styles.rejectButton} onClick={reject}>
          Từ chối
        </Button>
        <Button block={false} className={styles.confirmButton} disabled={invalid || points === 0} onClick={confirm}>
          Xác nhận · +{points} điểm
        </Button>
      </div>
    </>
  )
}

function HandledSummary({ tx }: { tx: Transaction }) {
  const goBack = useBack('/business/manage')
  return (
    <>
      <Card radius="lg" className={styles.summary}>
        {tx.status === 'confirmed' ? (
          <>
            {WASTE_TYPES.filter((t) => weightOf(tx.items, t.code) > 0).map((t) => (
              <div key={t.code} className={styles.summaryRow}>
                <span>{t.name}</span>
                <strong>{formatKg(weightOf(tx.items, t.code))}</strong>
              </div>
            ))}
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Đã cộng</span>
              <strong>{formatPoints(tx.points)}</strong>
            </div>
          </>
        ) : (
          <div className={styles.summaryRow}>
            <span>Lý do từ chối</span>
            <strong>{tx.rejectReason}</strong>
          </div>
        )}
      </Card>
      <Button onClick={goBack}>Quay lại</Button>
    </>
  )
}
