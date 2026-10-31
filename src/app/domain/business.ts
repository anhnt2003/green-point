import type {
  ActivityReport,
  BusinessStats,
  Expense,
  ExpenseCategory,
  StockMove,
  WasteCode,
} from './types'

/** Assumed prices recyclers pay a collection point, VND per kg (Hanoi scrap prices). */
export const SALE_PRICES: Record<WasteCode, number> = { paper: 5_000, pet: 10_000, aluminum: 35_000 }

/** What one point credited to a citizen costs the collection point. */
export const POINT_VALUE_VND = 100

/** "Tháng" on the dashboard and in reports: a rolling 30-day window. */
export const WINDOW_DAYS = 30

export const DAY_MS = 86_400_000

const round1 = (n: number) => Math.round(n * 10) / 10
const time = (iso: string) => new Date(iso).getTime()
const sum = (values: Iterable<number>) => [...values].reduce((s, v) => s + v, 0)

export const emptyByType = (): Record<WasteCode, number> => ({ paper: 0, pet: 0, aluminum: 0 })

export function startOfDay(d: Date): Date {
  const day = new Date(d)
  day.setHours(0, 0, 0, 0)
  return day
}

const daysBefore = (d: Date, days: number) => new Date(d.getTime() - days * DAY_MS)

/** Moves with `from < at <= to`. */
const within = <T extends { at: string }>(list: readonly T[], from: Date, to: Date) =>
  list.filter((m) => time(m.at) > from.getTime() && time(m.at) <= to.getTime())

/** Current stock per waste type: received minus sold. */
export function stockByType(moves: readonly StockMove[]): Record<WasteCode, number> {
  const stock = emptyByType()
  for (const m of moves) stock[m.code] += m.kind === 'in' ? m.kg : -m.kg
  for (const code of Object.keys(stock) as WasteCode[]) stock[code] = round1(stock[code])
  return stock
}

export interface PeriodSummary {
  intakeKg: number
  intakeByType: Record<WasteCode, number>
  /** Handovers received; one handover can cover several waste types. */
  orders: number
  soldKg: number
  salesVnd: number
  /** Points credited to citizens, at POINT_VALUE_VND. */
  pointsCostVnd: number
  operatingByCategory: Record<ExpenseCategory, number>
  /** Points cost + operating costs. */
  expensesVnd: number
  profitVnd: number
}

/** Figures of one collection point's ledger for `from < at <= to`. */
export function summarize(moves: readonly StockMove[], expenses: readonly Expense[], from: Date, to: Date): PeriodSummary {
  const period = within(moves, from, to)
  const intake = period.filter((m) => m.kind === 'in')
  const sales = period.filter((m) => m.kind === 'out')

  const intakeByType = emptyByType()
  for (const m of intake) intakeByType[m.code] += m.kg
  for (const code of Object.keys(intakeByType) as WasteCode[]) intakeByType[code] = round1(intakeByType[code])

  const operatingByCategory: Record<ExpenseCategory, number> = { transport: 0, labor: 0, utilities: 0, other: 0 }
  for (const e of within(expenses, from, to)) operatingByCategory[e.category] += e.amountVnd

  const salesVnd = Math.round(sum(sales.map((m) => m.kg * (m.priceVndPerKg ?? 0))))
  const pointsCostVnd = sum(intake.map((m) => m.points ?? 0)) * POINT_VALUE_VND
  const expensesVnd = pointsCostVnd + sum(Object.values(operatingByCategory))
  return {
    intakeKg: round1(sum(intake.map((m) => m.kg))),
    intakeByType,
    orders: new Set(intake.map((m) => m.orderId ?? m.id)).size,
    soldKg: round1(sum(sales.map((m) => m.kg))),
    salesVnd,
    pointsCostVnd,
    operatingByCategory,
    expensesVnd,
    profitVnd: salesVnd - expensesVnd,
  }
}

/** GreenBusiness dashboard (screen 09). */
export function businessStats(moves: readonly StockMove[], now: Date): BusinessStats {
  const intake = moves.filter((m) => m.kind === 'in')
  const kg = (list: readonly StockMove[]) => sum(list.map((m) => m.kg))
  const last = within(intake, daysBefore(now, WINDOW_DAYS), now)
  const previousKg = kg(within(intake, daysBefore(now, 2 * WINDOW_DAYS), daysBefore(now, WINDOW_DAYS)))
  const today = within(intake, new Date(startOfDay(now).getTime() - 1), now)
  return {
    totalWeightKg: round1(kg(intake)),
    monthOverMonthPct: previousKg > 0 ? Math.round((kg(last) / previousKg - 1) * 100) : 0,
    ordersToday: new Set(today.map((m) => m.orderId ?? m.id)).size,
    estimatedRevenueVnd: Math.round(sum(last.map((m) => m.kg * SALE_PRICES[m.code]))),
  }
}

/** Weight received per day for the last `days` days, oldest first, today last. */
export function dailyIntake(moves: readonly StockMove[], now: Date, days: number): { day: Date; kg: number }[] {
  const today = startOfDay(now)
  return Array.from({ length: days }, (_, n) => {
    const day = daysBefore(today, days - 1 - n)
    const end = new Date(Math.min(daysBefore(day, -1).getTime() - 1, now.getTime()))
    const kg = sum(within(moves, new Date(day.getTime() - 1), end).filter((m) => m.kind === 'in').map((m) => m.kg))
    return { day, kg: round1(kg) }
  })
}

/** GreenCapital: the collection point's last 30 days, attached to a loan application. */
export function activityReport(moves: readonly StockMove[], expenses: readonly Expense[], now: Date): ActivityReport {
  const period = summarize(moves, expenses, daysBefore(now, WINDOW_DAYS), now)
  return {
    periodDays: WINDOW_DAYS,
    intakeKg: period.intakeKg,
    intakeByType: period.intakeByType,
    orders: period.orders,
    salesVnd: period.salesVnd,
    expensesVnd: period.expensesVnd,
    stockKg: round1(sum(Object.values(stockByType(moves)))),
    monthOverMonthPct: businessStats(moves, now).monthOverMonthPct,
  }
}
