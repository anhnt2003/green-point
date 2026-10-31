import { Check, Clock } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Card } from '@/app/components/Card'
import { SectionTitle } from '@/app/components/SectionTitle'
import { LOAN_PURPOSES, WASTE_TYPES } from '@/app/data/seed'
import { formatDateTime, formatInt, formatKg, formatVnd } from '@/app/domain/format'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useStore } from '@/app/store/useStore'
import common from '../common.module.css'
import styles from './Ledger.module.css'

/** GreenCapital: one loan application, its progress and the activity report it carries (BR-08). */
export function LoanScreen() {
  const { id } = useParams()
  const loan = useStore((s) => s.loanApplications.find((l) => l.id === id))

  if (!loan) {
    return (
      <Screen header={<AppHeader title="Hồ sơ vay vốn" fallback="/business/capital" />}>
        <div className={common.empty}>Không tìm thấy hồ sơ này.</div>
      </Screen>
    )
  }

  const { report } = loan
  const steps = [
    { label: 'Tạo hồ sơ', detail: formatDateTime(loan.createdAt), state: 'done' },
    { label: 'Gửi tới ngân hàng, chương trình tài trợ phù hợp', state: 'done' },
    { label: 'Ngân hàng, tổ chức tài chính thẩm định', detail: 'Đang chờ phản hồi', state: 'current' },
    { label: 'Kết quả', state: 'todo' },
  ] as const
  const growth = `${report.monthOverMonthPct >= 0 ? '+' : ''}${report.monthOverMonthPct}%`

  return (
    <Screen header={<AppHeader title="Hồ sơ vay vốn" align="left" fallback="/business/capital" />}>
      <div className={common.content}>
        <Card radius="lg">
          <ol className={styles.steps}>
            {steps.map((step) => (
              <li
                key={step.label}
                className={`${styles.step} ${step.state === 'done' ? styles.stepDone : ''} ${
                  step.state === 'current' ? styles.stepCurrent : ''
                }`}
              >
                <span className={styles.stepDot}>
                  {step.state === 'done' ? <Check size={14} strokeWidth={3} /> : step.state === 'current' ? <Clock size={14} /> : null}
                </span>
                <span className={styles.stepText}>
                  <span>{step.label}</span>
                  {'detail' in step && <span className={common.caption}>{step.detail}</span>}
                </span>
              </li>
            ))}
          </ol>
        </Card>

        <div className={styles.section}>
          <SectionTitle>Nhu cầu vốn</SectionTitle>
        </div>
        <ul className={styles.purposeList}>
          {LOAN_PURPOSES.filter((p) => loan.purposes.includes(p.id)).map((p) => (
            <li key={p.id}>{p.label}</li>
          ))}
        </ul>

        <div className={styles.section}>
          <SectionTitle>Báo cáo hoạt động {report.periodDays} ngày</SectionTitle>
        </div>
        <Card radius="lg" className={styles.lines}>
          <div className={styles.line}>
            <span>Khối lượng thu gom</span>
            <strong>{formatKg(report.intakeKg)}</strong>
          </div>
          {WASTE_TYPES.map((t) => (
            <div key={t.code} className={`${styles.line} ${styles.lineSub}`}>
              <span>{t.name}</span>
              <span>{formatKg(report.intakeByType[t.code])}</span>
            </div>
          ))}
          <div className={styles.line}>
            <span>So với {report.periodDays} ngày trước</span>
            <strong>{growth}</strong>
          </div>
          <div className={styles.line}>
            <span>Lượt nhận rác</span>
            <strong>{formatInt(report.orders)}</strong>
          </div>
          <div className={styles.line}>
            <span>Tồn kho</span>
            <strong>{formatKg(report.stockKg)}</strong>
          </div>
          <div className={styles.line}>
            <span>Doanh thu bán phế liệu</span>
            <strong>{formatVnd(report.salesVnd)}</strong>
          </div>
          <div className={styles.line}>
            <span>Chi phí</span>
            <strong>{formatVnd(-report.expensesVnd)}</strong>
          </div>
          <div className={`${styles.line} ${styles.lineTotal}`}>
            <span>Lợi nhuận</span>
            <strong>{formatVnd(report.salesVnd - report.expensesVnd)}</strong>
          </div>
        </Card>

        <p className={common.caption}>
          GreenPoint chỉ hỗ trợ kết nối và cung cấp dữ liệu. Việc cấp tín dụng phụ thuộc vào quy định và thẩm định của
          ngân hàng, tổ chức tài chính.
        </p>
      </div>
    </Screen>
  )
}
