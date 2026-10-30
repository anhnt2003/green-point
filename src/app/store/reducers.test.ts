import { beforeEach, describe, expect, it } from 'vitest'
import { ACCOUNTS, DEMO_PASSWORD, REWARDS, WASTE_TYPES, createSeedState } from '@/app/data/seed'
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
    expect(res.state.users[STAFF].business).toMatchObject({ ordersToday: 16, totalWeightKg: 1253.9 })
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

  it('rejects with a reason: no points, no stats, cannot be confirmed later', () => {
    const res = r.rejectRecycle(pending(), { code: 'GP256789', staffUserId: STAFF, reason: 'Rác bẩn hoặc ướt', now: NOW })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.transaction).toMatchObject({ status: 'rejected', points: 0, estimatedPoints: 45, rejectReason: 'Rác bẩn hoặc ướt' })
    expect(res.state.users[CITIZEN].pointBalance).toBe(245)
    expect(res.state.users[STAFF].business).toMatchObject({ ordersToday: 15, totalWeightKg: 1250 })
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

  it('allows redeeming exactly the full balance', () => {
    const state = { ...seed, users: { ...seed.users, [CITIZEN]: { ...seed.users[CITIZEN], pointBalance: 150 } } }
    const res = r.redeemReward(state, { userId: CITIZEN, reward: reward('highlands-voucher'), now: NOW })
    expect(res.ok && res.state.users[CITIZEN].pointBalance).toBe(0)
  })
})

describe('loan application', () => {
  it('requires at least one purpose', () => {
    expect(r.createLoanApplication(seed, { userId: 'u-greenhouse', purposes: [], now: NOW })).toEqual({
      ok: false,
      error: 'NO_PURPOSE',
    })
  })

  it('records the selected purposes', () => {
    const res = r.createLoanApplication(seed, { userId: 'u-greenhouse', purposes: ['vehicle', 'technology'], now: NOW })
    expect(res.ok && res.state.loanApplications[0].purposes).toEqual(['vehicle', 'technology'])
  })
})

describe('seed isolation', () => {
  it('returns a fresh copy each time so reset is not affected by earlier mutations', () => {
    seed.users[CITIZEN].pointBalance = 1
    expect(createSeedState().users[CITIZEN].pointBalance).toBe(245)
  })
})
