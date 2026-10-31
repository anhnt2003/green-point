import { describe, expect, it } from 'vitest'
import { createSeedState } from '@/app/data/seed'
import { DATA_VERSION, migrateData } from './migrations'

/** What a v1 browser has in localStorage: the citizen was "Lan Anh" with id u-lananh. */
function v1State() {
  const seed = createSeedState()
  const { ['u-citizen']: citizen, ...others } = seed.users
  return {
    ...seed,
    session: { userId: 'u-lananh' },
    users: { ...others, 'u-lananh': { ...citizen, id: 'u-lananh', name: 'Lan Anh', avatarInitials: 'LA', pointBalance: 294 } },
    transactions: seed.transactions.map((t) => (t.userId === 'u-citizen' ? { ...t, userId: 'u-lananh' } : t)),
  }
}

describe('migrateData v1 -> v2 (mock user renamed to Tuấn Anh)', () => {
  it('renames the citizen and keeps their data', () => {
    const migrated = migrateData(v1State(), 1)
    expect(migrated.users['u-lananh']).toBeUndefined()
    expect(migrated.users['u-citizen']).toMatchObject({ id: 'u-citizen', name: 'Tuấn Anh', avatarInitials: 'TA', pointBalance: 294 })
  })

  it('moves the session and the transactions to the new id', () => {
    const migrated = migrateData(v1State(), 1)
    expect(migrated.session).toEqual({ userId: 'u-citizen' })
    expect(migrated.transactions.every((t) => t.userId !== 'u-lananh')).toBe(true)
    expect(migrated.transactions.filter((t) => t.userId === 'u-citizen')).toHaveLength(6)
  })

  it('leaves current-version data untouched', () => {
    const current = createSeedState()
    expect(migrateData(current, DATA_VERSION)).toEqual(current)
  })
})

/** What a v2 browser has: fixed business numbers, no ledger, no reward codes. */
function v2State() {
  const { stockMoves: _moves, expenses: _expenses, ...seed } = createSeedState()
  return {
    ...seed,
    users: {
      ...seed.users,
      'u-citizen': { ...seed.users['u-citizen'], notificationsSeenAt: undefined },
      'u-greenhouse': { ...seed.users['u-greenhouse'], business: { totalWeightKg: 1250, monthOverMonthPct: 12, ordersToday: 15, estimatedRevenueVnd: 8_500_000 } },
    },
    transactions: [
      {
        id: 't-GP256789', userId: 'u-citizen', type: 'recycle', status: 'confirmed', points: 49, code: 'GP256789',
        items: [{ code: 'paper', weightKg: 2.4 }], collectionPointId: 'green-house',
        createdAt: '2026-10-29T08:00:00Z', confirmedAt: '2026-10-29T09:00:00Z',
      },
      { id: 't-redeem-8-canvas-bag', userId: 'u-citizen', type: 'redeem', status: 'confirmed', points: -100, rewardId: 'canvas-bag', createdAt: '2026-10-29T10:00:00Z' },
      ...seed.transactions.map(({ rewardCode: _code, usedAt: _used, ...t }) => t),
    ],
    loanApplications: [{ id: 'loan-1', userId: 'u-greenhouse', purposes: ['vehicle'], createdAt: '2026-10-29T11:00:00Z', status: 'submitted' }],
  }
}

describe('migrateData v2 -> v3 (stock ledger, reward codes, notifications)', () => {
  const migrated = migrateData(v2State(), 2)

  it('drops the fixed business numbers and books app handovers into the ledger', () => {
    expect(migrated.users['u-greenhouse']).not.toHaveProperty('business')
    expect(migrated.stockMoves.find((m) => m.orderId === 'GP256789')).toMatchObject({ kind: 'in', code: 'paper', kg: 2.4, points: 24 })
    expect(migrated.expenses.length).toBeGreaterThan(0)
  })

  it('gives every redeemed reward a code in redemption order; only old seed gifts count as picked up', () => {
    const codes = Object.fromEntries(migrated.transactions.filter((t) => t.type === 'redeem').map((t) => [t.id, [t.rewardCode, !!t.usedAt]]))
    expect(codes).toEqual({
      't-seed-4': ['GQ100001', true],
      't-seed-2': ['GQ100002', true],
      't-redeem-8-canvas-bag': ['GQ100003', false],
    })
  })

  it('treats earlier events as seen and attaches a report to old loan applications', () => {
    expect(migrated.users['u-citizen'].notificationsSeenAt).toBeDefined()
    expect(migrated.loanApplications[0].report.periodDays).toBe(30)
  })
})
