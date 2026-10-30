import { CircleCheck } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/app/components/Button'
import { CapitalScene } from '@/app/components/illustrations/CapitalScene'
import { Logo } from '@/app/components/illustrations/Logo'
import { SectionTitle } from '@/app/components/SectionTitle'
import { LOAN_PURPOSES } from '@/app/data/seed'
import { formatInt, formatKg, formatMillions } from '@/app/domain/format'
import type { LoanPurpose } from '@/app/domain/types'
import { openDialog, toast } from '@/app/feedback/useFeedback'
import { Screen } from '@/app/layout/Screen'
import { useCurrentUser } from '@/app/store/selectors'
import { useStore } from '@/app/store/useStore'
import common from '../common.module.css'
import styles from './Business.module.css'

/** Screen 10 — GreenCapital: pick funding purposes and create a loan profile (BR-08). */
export function GreenCapitalScreen() {
  const [selected, setSelected] = useState<LoanPurpose[]>([])
  const stats = useCurrentUser()?.business
  const createLoanApplication = useStore((s) => s.createLoanApplication)

  const toggle = (id: LoanPurpose) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  const submit = async () => {
    const res = createLoanApplication(selected)
    if (!res.ok) {
      toast('Chọn ít nhất một mục đích cần vốn', 'error')
      return
    }
    const purposes = LOAN_PURPOSES.filter((p) => selected.includes(p.id)).map((p) => p.label.toLowerCase())
    setSelected([])
    await openDialog({
      title: 'Đã tạo hồ sơ vay vốn',
      message: `Hồ sơ gồm nhu cầu: ${purposes.join(', ')}; kèm dữ liệu hoạt động ${
        stats ? `${formatKg(stats.totalWeightKg)} thu gom, ${formatInt(stats.ordersToday)} đơn hôm nay, doanh thu ước tính ${formatMillions(stats.estimatedRevenueVnd)}` : ''
      }. GreenPoint sẽ kết nối bạn với ngân hàng hoặc chương trình tài trợ phù hợp.`,
      actions: [{ label: 'Đóng', value: 'ok', role: 'primary' }],
    })
  }

  return (
    <Screen>
      <div className={common.content}>
        <div className={styles.capitalHead}>
          <div className={styles.capitalBrand}>
            <Logo size={30} />
            <h1 className={styles.capitalTitle}>GreenCapital</h1>
          </div>
          <p className={styles.capitalSubtitle}>Kết nối vốn xanh - Phát triển bền vững</p>
        </div>

        <div className={styles.capitalScene}>
          <CapitalScene />
        </div>

        <div className={styles.section}>
          <SectionTitle>Bạn cần vốn để làm gì?</SectionTitle>
        </div>
        <ul className={styles.purposes} role="group" aria-label="Mục đích vay vốn">
          {LOAN_PURPOSES.map((p) => {
            const checked = selected.includes(p.id)
            return (
              <li key={p.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  className={`${styles.purpose} ${checked ? styles.purposeChecked : ''} pressable`}
                  onClick={() => toggle(p.id)}
                >
                  <CircleCheck
                    size={24}
                    strokeWidth={2}
                    {...(checked ? { fill: 'var(--c-primary)', stroke: '#ffffff' } : {})}
                    className={styles.purposeIcon}
                  />
                  <span>{p.label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <Button onClick={submit}>Tạo hồ sơ vay vốn</Button>

        <p className={`${common.caption} ${styles.disclaimer}`}>
          GreenPoint chỉ hỗ trợ kết nối và cung cấp dữ liệu. Việc cấp tín dụng phụ thuộc vào quy định và thẩm định của
          ngân hàng, tổ chức tài chính.
        </p>
      </div>
    </Screen>
  )
}
