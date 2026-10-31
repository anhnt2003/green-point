import { describe, expect, it } from 'vitest'
import { createSeedState } from '@/app/data/seed'
import { activityReport, businessStats, dailyIntake, stockByType, summarize } from './business'
import { formatMillions } from './format'
import type { Expense, StockMove } from './types'

const NOW = new Date('2026-10-30T10:00:00')
const at = (daysAgo: number, hour = 9) => {
  const d = new Date(NOW)
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}
const move = (m: Partial<StockMove> & Pick<StockMove, 'kind' | 'code' | 'kg' | 'at'>): StockMove => ({
  id: `${m.kind}-${m.code}-${m.at}`,
  pointId: 'p',
  ...m,
})

describe('stockByType', () => {
  it('is received minus sold', () => {
    const moves = [
      move({ kind: 'in', code: 'paper', kg: 10, at: at(3) }),
      move({ kind: 'in', code: 'paper', kg: 2.5, at: at(2) }),
      move({ kind: 'out', code: 'paper', kg: 8, at: at(1) }),
      move({ kind: 'in', code: 'pet', kg: 1.2, at: at(1) }),
    ]
    expect(stockByType(moves)).toEqual({ paper: 4.5, pet: 1.2, aluminum: 0 })
  })
})

describe('businessStats', () => {
  it('compares the last 30 days with the 30 before and counts handovers of today', () => {
    const moves = [
      move({ kind: 'in', code: 'paper', kg: 10, at: at(45), orderId: 'a' }),
      move({ kind: 'in', code: 'paper', kg: 6, at: at(10), orderId: 'b' }),
      move({ kind: 'in', code: 'pet', kg: 5, at: at(0, 8), orderId: 'c' }),
      move({ kind: 'in', code: 'aluminum', kg: 1, at: at(0, 8), orderId: 'c' }),
      move({ kind: 'out', code: 'paper', kg: 10, at: at(5) }),
    ]
    expect(businessStats(moves, NOW)).toEqual({
      totalWeightKg: 22,
      monthOverMonthPct: 20,
      ordersToday: 1,
      estimatedRevenueVnd: 6 * 5_000 + 5 * 10_000 + 1 * 35_000,
    })
  })

  it('opens the seeded dashboard as in the mockup', () => {
    const { stockMoves } = createSeedState(NOW)
    const stats = businessStats(stockMoves, NOW)
    expect(stats.totalWeightKg).toBe(1250)
    expect(stats.monthOverMonthPct).toBe(12)
    expect(stats.ordersToday).toBe(15)
    expect(formatMillions(stats.estimatedRevenueVnd)).toBe('8.5 triệu')
  })
})

describe('summarize', () => {
  it('counts sales as revenue, credited points and operating costs as expenses', () => {
    const moves = [
      move({ kind: 'in', code: 'paper', kg: 3, at: at(2), orderId: 'a', points: 30 }),
      move({ kind: 'in', code: 'pet', kg: 1, at: at(2), orderId: 'a', points: 15 }),
      move({ kind: 'out', code: 'paper', kg: 3, at: at(1), priceVndPerKg: 5_000 }),
      move({ kind: 'in', code: 'paper', kg: 99, at: at(40), points: 990 }),
    ]
    const expenses: Expense[] = [
      { id: 'e1', pointId: 'p', category: 'transport', amountVnd: 4_000, at: at(1) },
      { id: 'e2', pointId: 'p', category: 'labor', amountVnd: 1_000_000, at: at(40) },
    ]
    const s = summarize(moves, expenses, new Date(at(30)), NOW)
    expect(s).toMatchObject({
      intakeKg: 4,
      intakeByType: { paper: 3, pet: 1, aluminum: 0 },
      orders: 1,
      soldKg: 3,
      salesVnd: 15_000,
      pointsCostVnd: 4_500,
      expensesVnd: 8_500,
      profitVnd: 6_500,
    })
    expect(s.operatingByCategory).toEqual({ transport: 4_000, labor: 0, utilities: 0, other: 0 })
  })

  it('keeps the seeded month profitable with stock left over', () => {
    const { stockMoves, expenses } = createSeedState(NOW)
    const report = activityReport(stockMoves, expenses, NOW)
    expect(report.intakeKg).toBe(660)
    expect(report.salesVnd).toBeGreaterThan(report.expensesVnd)
    expect(report.stockKg).toBeGreaterThan(0)
    expect(Object.values(stockByType(stockMoves)).every((kg) => kg >= 0)).toBe(true)
  })
})

describe('dailyIntake', () => {
  it('returns one bar per day, today last', () => {
    const moves = [
      move({ kind: 'in', code: 'paper', kg: 2, at: at(0, 8) }),
      move({ kind: 'in', code: 'pet', kg: 1.5, at: at(2, 23) }),
      move({ kind: 'out', code: 'paper', kg: 9, at: at(0, 9) }),
    ]
    expect(dailyIntake(moves, NOW, 4).map((d) => d.kg)).toEqual([0, 1.5, 0, 2])
  })
})
