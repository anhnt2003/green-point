import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { FilterChips, type ChipOption } from '@/app/components/FilterChips'
import { WasteIcon } from '@/app/components/illustrations/WasteIcon'
import { ProgressBar } from '@/app/components/ProgressBar'
import { SectionTitle } from '@/app/components/SectionTitle'
import { StatCard } from '@/app/components/StatCard'
import { EXPENSE_CATEGORIES, WASTE_TYPES } from '@/app/data/seed'
import { DAY_MS, dailyIntake, summarize } from '@/app/domain/business'
import { formatInt, formatKg, formatKgValue, formatVnd } from '@/app/domain/format'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { usePointExpenses, usePointMoves } from '@/app/store/selectors'
import common from '../common.module.css'
import { IntakeChart } from './IntakeChart'
import styles from './Ledger.module.css'

type Period = '7' | '30'

const PERIODS: readonly ChipOption<Period>[] = [
  { value: '7', label: '7 ngày' },
  { value: '30', label: '30 ngày' },
]

/** Quản lý kho → Báo cáo (F-11, F-12): intake, revenue from sales, costs and profit. */
export function ReportsScreen() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('30')
  const moves = usePointMoves()
  const expenses = usePointExpenses()
  const days = Number(period)
  const now = new Date()
  const s = summarize(moves, expenses, new Date(now.getTime() - days * DAY_MS), now)

  return (
    <Screen header={<AppHeader title="Báo cáo" align="left" fallback="/business" />}>
      <div className={common.content}>
        <FilterChips options={PERIODS} value={period} onChange={setPeriod} variant="tabs" ariaLabel="Khoảng thời gian" />

        <div className={common.row2}>
          <StatCard label="Khối lượng nhận" value={formatKgValue(s.intakeKg)} unit="kg" tone="primary" />
          <StatCard label="Lượt nhận rác" value={formatInt(s.orders)} unit="lượt" tone="primary" />
        </div>

        <Card radius="lg" className={styles.chartCard}>
          <span className={styles.chartTitle}>Khối lượng nhận theo ngày</span>
          <IntakeChart data={dailyIntake(moves, now, days)} />
        </Card>

        <div className={styles.section}>
          <SectionTitle>Thu chi</SectionTitle>
        </div>
        <Card radius="lg" className={styles.lines}>
          <div className={styles.line}>
            <span>Bán cho đơn vị tái chế ({formatKg(s.soldKg)})</span>
            <strong>{formatVnd(s.salesVnd)}</strong>
          </div>
          <div className={styles.line}>
            <span>Chi phí</span>
            <strong>{formatVnd(-s.expensesVnd)}</strong>
          </div>
          <div className={`${styles.line} ${styles.lineTotal} ${s.profitVnd < 0 ? styles.negative : ''}`}>
            <span>Lợi nhuận</span>
            <strong>{formatVnd(s.profitVnd)}</strong>
          </div>
        </Card>

        <div className={styles.section}>
          <SectionTitle>Theo loại rác</SectionTitle>
        </div>
        <Card radius="lg" className={styles.lines}>
          {WASTE_TYPES.map((t) => (
            <div key={t.code} className={styles.share}>
              <WasteIcon code={t.code} size={36} />
              <div>
                <span className={common.caption}>{t.name}</span>
                <ProgressBar value={s.intakeKg ? s.intakeByType[t.code] / s.intakeKg : 0} label={t.name} />
              </div>
              <strong>{formatKg(s.intakeByType[t.code])}</strong>
            </div>
          ))}
        </Card>

        <div className={styles.section}>
          <SectionTitle>Chi phí</SectionTitle>
        </div>
        <Card radius="lg" className={styles.lines}>
          <div className={styles.line}>
            <span>Điểm thưởng cho người dân</span>
            <strong>{formatVnd(s.pointsCostVnd)}</strong>
          </div>
          {EXPENSE_CATEGORIES.map((c) => (
            <div key={c.id} className={styles.line}>
              <span>{c.label}</span>
              <strong>{formatVnd(s.operatingByCategory[c.id])}</strong>
            </div>
          ))}
          <div className={`${styles.line} ${styles.lineTotal}`}>
            <span>Tổng chi phí</span>
            <strong>{formatVnd(s.expensesVnd)}</strong>
          </div>
        </Card>
        <Button variant="outline" onClick={() => navigate('/business/expenses')}>
          Xem và thêm chi phí
        </Button>
      </div>
    </Screen>
  )
}
