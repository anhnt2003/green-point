import { beforeEach, describe, expect, it } from 'vitest'
import { ACCOUNTS, DEMO_PASSWORD, REWARDS, WASTE_TYPES, createSeedState } from '@/app/data/seed'
import { stockByType } from '@/app/domain/business'
import type { DataState } from '@/app/domain/types'
import * as r from './reducers'

const NOW = '2026-10-30T10:00:00'
const CITIZEN = 'u-citizen'
const MOCKUP_ITEMS = [
  { code: 'paper' as const, weightKg: 2 },
  { code: 'pet' as const, weightKg: 1 },
  { code: 'aluminum' as const, weightKg: 0.5 },
]
const reward = (id: string) => REWARDS.find((x) => x.id === id)!

let seed: DataState
beforeEach(() => {
  seed = createSeedState()
})

describe('seed data', () => {
  it('matches the home screen: 245 points, 8.5 kg, 6 transactions', () => {
    const user = seed.users[CITIZEN]
    expect(user.pointBalance).toBe(245)
    expect(user.weightByType.paper + user.weightByType.pet + user.weightByType.aluminum).toBe(8.5)
    expect(seed.transactions.filter((t) => t.userId === CITIZEN)).toHaveLength(6)
  })
})

describe('login', () => {
  it('accepts the demo citizen account and opens a session', () => {
    const res = r.login(seed, ACCOUNTS, ' Citizen ', DEMO_PASSWORD)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.user.role).toBe('citizen')
      expect(res.state.session).toEqual({ userId: CITIZEN })
    }
  })

  it('rejects a wrong password', () => {
    expect(r.login(seed, ACCOUNTS, 'citizen', 'wrong')).toEqual({ ok: false, error: 'INVALID_CREDENTIALS' })
  })

  it('logs in the business account with the business role', () => {
    const res = r.login(seed, ACCOUNTS, 'business', DEMO_PASSWORD)
    expect(res.ok && res.user.role).toBe('business')
  })
})

describe('recycle flow (BR-04)', () => {
  const create = (state: DataState) =>
    r.createRecycle(state, { userId: CITIZEN, items: MOCKUP_ITEMS, collectionPointId: 'green-house', now: NOW }, WASTE_TYPES)

  it('creates a pending transaction GP256789 worth 45 points without changing the balance', () => {
    const res = create(seed)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.transaction).toMatchObject({ code: 'GP256789', status: 'pending', points: 45 })
    expect(res.state.users[CITIZEN].pointBalance).toBe(245)
  })

  it('rejects an all-zero submission', () => {
    const res = r.createRecycle(
      seed,
      { userId: CITIZEN, items: [{ code: 'paper', weightKg: 0 }], collectionPointId: 'green-house', now: NOW },
      WASTE_TYPES,
    )
    expect(res).toEqual({ ok: false, error: 'EMPTY' })
  })

  it('increments the code for the next transaction', () => {
    const first = create(seed)
    if (!first.ok) throw new Error('create failed')
    const second = create(first.state)
    expect(second.ok && second.transaction.code).toBe('GP256790')
  })
})

describe('staff confirmation (F-07, BR-04)', () => {
  const STAFF = 'u-greenhouse'
  const pending = () => {
    const res = r.createRecycle(
      seed,
      { userId: CITIZEN, items: MOCKUP_ITEMS, collectionPointId: 'green-house', now: NOW },
      WASTE_TYPES,
    )
    if (!res.ok) throw new Error('create failed')
    return res.state
  }
  const ACTUAL = [
    { code: 'paper' as const, weightKg: 2.4 },
    { code: 'pet' as const, weightKg: 1 },
    { code: 'aluminum' as const, weightKg: 0.5 },
  ]
  const confirm = (state: DataState, actualItems = ACTUAL, staffUserId = STAFF) =>
    r.confirmRecycle(state, { code: 'GP256789', staffUserId, actualItems, now: NOW }, WASTE_TYPES)

  it('stays pending until a staff member confirms (no automatic credit)', () => {
    const state = pending()
    expect(state.transactions[0].status).toBe('pending')
    expect(state.users[CITIZEN].pointBalance).toBe(245)
  })

  it('credits points from the actual scale weight and keeps the estimate for reference', () => {
    const res = confirm(pending())
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.transaction).toMatchObject({
      status: 'confirmed',
      points: 49,
      estimatedPoints: 45,
      handledBy: STAFF,
      items: ACTUAL,
      estimatedItems: MOCKUP_ITEMS,
    })
    expect(res.state.users[CITIZEN].pointBalance).toBe(294)
    expect(res.state.users[CITIZEN].weightByType).toEqual({ paper: 6.9, pet: 3.5, aluminum: 2 })
    expect(res.state.stockMoves.slice(0, 3)).toEqual([
      { id: 'in-GP256789-paper', pointId: 'green-house', kind: 'in', code: 'paper', kg: 2.4, at: NOW, orderId: 'GP256789', points: 24 },
      { id: 'in-GP256789-pet', pointId: 'green-house', kind: 'in', code: 'pet', kg: 1, at: NOW, orderId: 'GP256789', points: 15 },
      { id: 'in-GP256789-aluminum', pointId: 'green-house', kind: 'in', code: 'aluminum', kg: 0.5, at: NOW, orderId: 'GP256789', points: 10 },
    ])
  })

  it('drops waste types the staff weighed at 0 kg', () => {
    const res = confirm(pending(), [
      { code: 'paper', weightKg: 3 },
      { code: 'pet', weightKg: 0 },
      { code: 'aluminum', weightKg: 0 },
    ])
    expect(res.ok && res.transaction.items).toEqual([{ code: 'paper', weightKg: 3 }])
    expect(res.ok && res.transaction.points).toBe(30)
  })

  it('credits only once', () => {
    const once = confirm(pending())
    if (!once.ok) throw new Error('confirm failed')
    expect(confirm(once.state)).toEqual({ ok: false, error: 'NOT_PENDING' })
  })

  it('refuses an all-zero weighing (the staff should reject instead)', () => {
    expect(confirm(pending(), [{ code: 'paper', weightKg: 0 }])).toEqual({ ok: false, error: 'EMPTY' })
  })

  it('refuses an unknown code', () => {
    expect(r.confirmRecycle(pending(), { code: 'GP000000', staffUserId: STAFF, actualItems: ACTUAL, now: NOW }, WASTE_TYPES))
      .toEqual({ ok: false, error: 'NOT_FOUND' })
  })

  it('refuses staff from another collection point', () => {
    const state = pending()
    const other = { ...state.users[STAFF], id: 'u-other', collectionPointId: 'bach-mai' }
    const withOther = { ...state, users: { ...state.users, [other.id]: other } }
    expect(confirm(withOther, ACTUAL, 'u-other')).toEqual({ ok: false, error: 'OTHER_POINT' })
  })

  it('rejects with a reason: no points, no stock, cannot be confirmed later', () => {
    const res = r.rejectRecycle(pending(), { code: 'GP256789', staffUserId: STAFF, reason: 'Rác bẩn hoặc ướt', now: NOW })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.transaction).toMatchObject({ status: 'rejected', points: 0, estimatedPoints: 45, rejectReason: 'Rác bẩn hoặc ướt' })
    expect(res.state.users[CITIZEN].pointBalance).toBe(245)
    expect(res.state.stockMoves).toEqual(seed.stockMoves)
    expect(confirm(res.state)).toEqual({ ok: false, error: 'NOT_PENDING' })
  })
})

describe('redeem (BR-05)', () => {
  it('rejects a 300-point reward when the balance is 245 and keeps the balance', () => {
    const res = r.redeemReward(seed, { userId: CITIZEN, reward: reward('mini-plant'), now: NOW })
    expect(res).toEqual({ ok: false, error: 'INSUFFICIENT_POINTS' })
    expect(seed.users[CITIZEN].pointBalance).toBe(245)
  })

  it('deducts 100 points and records a negative history entry', () => {
    const res = r.redeemReward(seed, { userId: CITIZEN, reward: reward('canvas-bag'), now: NOW })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.state.users[CITIZEN].pointBalance).toBe(145)
    expect(res.state.transactions[0]).toMatchObject({ type: 'redeem', points: -100, rewardId: 'canvas-bag' })
  })

  it('gives a pickup code for a gift and a voucher code for a voucher', () => {
    const gift = r.redeemReward(seed, { userId: CITIZEN, reward: reward('canvas-bag'), now: NOW })
    if (!gift.ok) throw new Error('redeem failed')
    expect(gift.transaction.rewardCode).toBe('GQ100003')
    const voucher = r.redeemReward(gift.state, { userId: CITIZEN, reward: reward('canvas-bag'), now: NOW })
    expect(voucher.ok && voucher.transaction.rewardCode).toBe('GQ100004')
    const rich = { ...seed, users: { ...seed.users, [CITIZEN]: { ...seed.users[CITIZEN], pointBalance: 500 } } }
    const hl = r.redeemReward(rich, { userId: CITIZEN, reward: reward('highlands-voucher'), now: NOW })
    expect(hl.ok && hl.transaction.rewardCode).toBe('GV100003')
  })

  it('marks a reward used once', () => {
    const res = r.redeemReward(seed, { userId: CITIZEN, reward: reward('canvas-bag'), now: NOW })
    if (!res.ok) throw new Error('redeem failed')
    const input = { userId: CITIZEN, transactionId: res.transaction.id, now: NOW }
    const used = r.markRewardUsed(res.state, input)
    expect(used.ok && used.state.transactions[0].usedAt).toBe(NOW)
    expect(used.ok && r.markRewardUsed(used.state, input)).toEqual({ ok: false, error: 'ALREADY_USED' })
    expect(r.markRewardUsed(res.state, { ...input, userId: 'u-greenhouse' })).toEqual({ ok: false, error: 'NOT_FOUND' })
  })

  it('allows redeeming exactly the full balance', () => {
    const state = { ...seed, users: { ...seed.users, [CITIZEN]: { ...seed.users[CITIZEN], pointBalance: 150 } } }
    const res = r.redeemReward(state, { userId: CITIZEN, reward: reward('highlands-voucher'), now: NOW })
    expect(res.ok && res.state.users[CITIZEN].pointBalance).toBe(0)
  })
})

describe('notifications', () => {
  it('remembers when the citizen last opened them', () => {
    const state = r.markNotificationsSeen(seed, { userId: CITIZEN, now: NOW })
    expect(state.users[CITIZEN].notificationsSeenAt).toBe(NOW)
  })
})

describe('stock and costs of the collection point (F-11, F-12)', () => {
  const STAFF = 'u-greenhouse'
  const stockOf = (state: DataState) => stockByType(state.stockMoves.filter((m) => m.pointId === 'green-house'))
  const sell = (state: DataState, kg: number, priceVndPerKg = 5_000) =>
    r.sellStock(state, { staffUserId: STAFF, code: 'paper', kg, priceVndPerKg, buyer: 'Đối tác tái chế giấy', now: NOW })

  it('sells from stock to a recycler', () => {
    const before = stockOf(seed).paper
    const res = sell(seed, 10)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(stockOf(res.state).paper).toBeCloseTo(before - 10, 5)
    expect(res.state.stockMoves[0]).toMatchObject({ kind: 'out', code: 'paper', kg: 10, priceVndPerKg: 5_000, at: NOW })
  })

  it('cannot sell more than the stock, nothing, or for free', () => {
    expect(sell(seed, stockOf(seed).paper + 0.1)).toEqual({ ok: false, error: 'NOT_ENOUGH_STOCK' })
    expect(sell(seed, 0)).toEqual({ ok: false, error: 'INVALID' })
    expect(sell(seed, 1, 0)).toEqual({ ok: false, error: 'INVALID' })
  })

  it('only staff of a collection point can sell or add costs', () => {
    expect(r.sellStock(seed, { staffUserId: CITIZEN, code: 'paper', kg: 1, priceVndPerKg: 1, buyer: 'x', now: NOW }))
      .toEqual({ ok: false, error: 'NO_POINT' })
    expect(r.addExpense(seed, { staffUserId: CITIZEN, category: 'other', amountVnd: 1, note: '', now: NOW }))
      .toEqual({ ok: false, error: 'NO_POINT' })
  })

  it('records an operating cost', () => {
    const res = r.addExpense(seed, { staffUserId: STAFF, category: 'transport', amountVnd: 250_000, note: ' Xăng xe ', now: NOW })
    expect(res.ok && res.state.expenses[0]).toMatchObject({ pointId: 'green-house', category: 'transport', amountVnd: 250_000, note: 'Xăng xe' })
    expect(r.addExpense(seed, { staffUserId: STAFF, category: 'transport', amountVnd: 0, note: '', now: NOW }))
      .toEqual({ ok: false, error: 'INVALID' })
  })
})

describe('loan application', () => {
  it('requires at least one purpose', () => {
    expect(r.createLoanApplication(seed, { userId: 'u-greenhouse', purposes: [], now: NOW })).toEqual({
      ok: false,
      error: 'NO_PURPOSE',
    })
  })

  it('records the selected purposes with a report of the last 30 days', () => {
    const state = createSeedState(new Date(NOW))
    const res = r.createLoanApplication(state, { userId: 'u-greenhouse', purposes: ['vehicle', 'technology'], now: NOW })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.state.loanApplications[0]).toMatchObject({ purposes: ['vehicle', 'technology'], status: 'submitted' })
    expect(res.application.report).toMatchObject({ periodDays: 30, intakeKg: 660, monthOverMonthPct: 12 })
  })

  it('is for collection points only', () => {
    expect(r.createLoanApplication(seed, { userId: CITIZEN, purposes: ['vehicle'], now: NOW })).toEqual({
      ok: false,
      error: 'NO_POINT',
    })
  })
})

describe('seed isolation', () => {
  it('returns a fresh copy each time so reset is not affected by earlier mutations', () => {
    seed.users[CITIZEN].pointBalance = 1
    expect(createSeedState().users[CITIZEN].pointBalance).toBe(245)
  })
})
