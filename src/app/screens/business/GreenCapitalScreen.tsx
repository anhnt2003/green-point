import { CircleCheck, FileText } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/app/components/Button'
import { CapitalScene } from '@/app/components/illustrations/CapitalScene'
import { Logo } from '@/app/components/illustrations/Logo'
import { ListRow } from '@/app/components/ListRow'
import { SectionTitle } from '@/app/components/SectionTitle'
import { LOAN_PURPOSES } from '@/app/data/seed'
import { formatDateTime } from '@/app/domain/format'
import type { LoanPurpose } from '@/app/domain/types'
import { openDialog, toast } from '@/app/feedback/useFeedback'
import { Screen } from '@/app/layout/Screen'
import { useStore } from '@/app/store/useStore'
import common from '../common.module.css'
import styles from './Business.module.css'

/** Screen 10 — GreenCapital: pick funding purposes and create a loan profile (BR-08). */
export function GreenCapitalScreen() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<LoanPurpose[]>([])
  const createLoanApplication = useStore((s) => s.createLoanApplication)
  const applications = useStore(useShallow((s) => s.loanApplications.filter((l) => l.userId === s.session?.userId)))

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
    const next = await openDialog({
      title: 'Đã tạo hồ sơ vay vốn',
      message: `Hồ sơ gồm nhu cầu: ${purposes.join(', ')}; kèm báo cáo hoạt động 30 ngày gần nhất của điểm thu gom. GreenPoint sẽ kết nối bạn với ngân hàng hoặc chương trình tài trợ phù hợp.`,
      actions: [
        { label: 'Đóng', value: 'close', role: 'cancel' },
        { label: 'Xem hồ sơ', value: 'open', role: 'primary' },
      ],
    })
    if (next === 'open') navigate(`/business/capital/${res.id}`)
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

        {applications.length > 0 && (
          <>
            <div className={styles.section}>
              <SectionTitle>Hồ sơ đã tạo ({applications.length})</SectionTitle>
            </div>
            <div className={styles.list}>
              {applications.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`${styles.loanRow} pressable`}
                  onClick={() => navigate(`/business/capital/${l.id}`)}
                >
                  <ListRow
                    icon={<FileText size={22} />}
                    title={LOAN_PURPOSES.filter((p) => l.purposes.includes(p.id))
                      .map((p) => p.label)
                      .join(', ')}
                    subtitle={formatDateTime(l.createdAt)}
                    value="Chờ thẩm định"
                    valueTone="muted"
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}
