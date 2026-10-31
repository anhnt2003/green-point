import { Package, Plus, Truck, Users, Zap, type LucideIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { FilterChips } from '@/app/components/FilterChips'
import { ListRow } from '@/app/components/ListRow'
import { SectionTitle } from '@/app/components/SectionTitle'
import { TextField } from '@/app/components/TextField'
import { EXPENSE_CATEGORIES } from '@/app/data/seed'
import { DAY_MS, POINT_VALUE_VND, WINDOW_DAYS, summarize } from '@/app/domain/business'
import { formatDateTime, formatVnd, parseVnd } from '@/app/domain/format'
import type { ExpenseCategory } from '@/app/domain/types'
import { toast } from '@/app/feedback/useFeedback'
import { AppHeader, HeaderAction, useBack } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { usePointExpenses, usePointMoves } from '@/app/store/selectors'
import { useStore } from '@/app/store/useStore'
import common from '../common.module.css'
import styles from './Ledger.module.css'

const ICON: Record<ExpenseCategory, LucideIcon> = { transport: Truck, labor: Users, utilities: Zap, other: Package }
const labelOf = (id: ExpenseCategory) => EXPENSE_CATEGORIES.find((c) => c.id === id)?.label ?? id

/** F-12 Chi phí: running costs entered by the collection point; points paid out are counted automatically. */
export function ExpensesScreen() {
  const navigate = useNavigate()
  const moves = usePointMoves()
  const expenses = usePointExpenses()
  const now = new Date()
  const month = summarize(moves, expenses, new Date(now.getTime() - WINDOW_DAYS * DAY_MS), now)
  const list = [...expenses].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  const add = () => navigate('/business/expenses/new')

  return (
    <Screen
      header={
        <AppHeader
          title="Chi phí"
          align="left"
          fallback="/business/reports"
          right={
            <HeaderAction label="Thêm chi phí" onClick={add}>
              <Plus size={22} strokeWidth={2.2} />
            </HeaderAction>
          }
        />
      }
    >
      <div className={common.content}>
        <Card radius="lg" className={styles.hero}>
          <span className={styles.heroLabel}>Chi phí {WINDOW_DAYS} ngày qua</span>
          <span className={styles.heroValue}>{formatVnd(month.expensesVnd)}</span>
          <span className={common.caption}>
            Gồm {formatVnd(month.pointsCostVnd)} điểm thưởng cho người dân (1 điểm = {formatVnd(POINT_VALUE_VND)}), tính
            tự động khi cân và xác nhận.
          </span>
        </Card>

        <Button onClick={add}>Thêm chi phí</Button>

        <div className={styles.section}>
          <SectionTitle>Chi phí vận hành đã ghi</SectionTitle>
        </div>
        {list.length === 0 ? (
          <p className={`${common.caption} ${styles.emptyLine}`}>Chưa ghi chi phí nào.</p>
        ) : (
          <div className={styles.list}>
            {list.map((e) => {
              const Icon = ICON[e.category]
              return (
                <ListRow
                  key={e.id}
                  icon={<Icon size={22} />}
                  iconTone="warm"
                  title={labelOf(e.category)}
                  subtitle={`${e.note ? `${e.note} · ` : ''}${formatDateTime(e.at)}`}
                  value={formatVnd(-e.amountVnd)}
                  valueTone="negative"
                />
              )
            })}
          </div>
        )}
      </div>
    </Screen>
  )
}

export function AddExpenseScreen() {
  const goBack = useBack('/business/expenses')
  const addExpense = useStore((s) => s.addExpense)
  const [category, setCategory] = useState<ExpenseCategory>('transport')
  const [amountText, setAmountText] = useState('')
  const [note, setNote] = useState('')
  const amount = parseVnd(amountText)
  const valid = amount !== null && amount > 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    const res = addExpense({ category, amountVnd: amount, note })
    if (!res.ok) {
      toast('Không ghi được chi phí. Vui lòng thử lại.', 'error')
      return
    }
    toast(`Đã ghi chi phí ${formatVnd(amount)}`)
    goBack()
  }

  return (
    <Screen header={<AppHeader title="Thêm chi phí" fallback="/business/expenses" />}>
      <form className={`${common.content} ${styles.form}`} onSubmit={submit}>
        <SectionTitle>Loại chi phí</SectionTitle>
        <FilterChips
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
          value={category}
          onChange={setCategory}
          ariaLabel="Loại chi phí"
        />
        <TextField
          label="Số tiền"
          inputMode="numeric"
          placeholder="0"
          value={amountText}
          invalid={amountText !== '' && !valid}
          trailing={<span className={styles.unit}>đ</span>}
          onChange={(e) => setAmountText(e.target.value)}
        />
        <TextField
          label="Ghi chú"
          placeholder="Ví dụ: Thuê xe chở hàng"
          maxLength={80}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button type="submit" disabled={!valid}>
          Lưu chi phí
        </Button>
      </form>
    </Screen>
  )
}
