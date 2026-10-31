import { describe, expect, it } from 'vitest'
import { REWARDS } from '@/app/data/seed'
import { countUnread, notificationsFor } from './notifications'
import type { Transaction } from './types'

const tx = (t: Partial<Transaction> & Pick<Transaction, 'id' | 'type' | 'status' | 'createdAt'>): Transaction => ({
  userId: 'u',
  points: 0,
  ...t,
})

describe('notificationsFor', () => {
  const list = notificationsFor(
    [
      tx({ id: 'a', type: 'recycle', status: 'pending', createdAt: '2026-10-30T08:00:00Z', code: 'GP1' }),
      tx({ id: 'b', type: 'recycle', status: 'confirmed', points: 49, code: 'GP2', createdAt: '2026-10-29T08:00:00Z', confirmedAt: '2026-10-30T09:00:00Z' }),
      tx({ id: 'c', type: 'recycle', status: 'rejected', code: 'GP3', rejectReason: 'Rác bẩn hoặc ướt', createdAt: '2026-10-30T07:00:00Z', confirmedAt: '2026-10-30T07:30:00Z' }),
      tx({ id: 'd', type: 'redeem', status: 'confirmed', points: -150, rewardId: 'highlands-voucher', rewardCode: 'GV100003', createdAt: '2026-10-30T10:00:00Z' }),
    ],
    REWARDS,
  )

  it('skips pending handovers and sorts newest first', () => {
    expect(list.map((n) => n.id)).toEqual(['d:redeemed', 'b:confirmed', 'c:rejected'])
  })

  it('says what happened and links to the details', () => {
    expect(list[0]).toMatchObject({ title: 'Đổi quà thành công', body: 'Voucher Highlands Coffee · mã GV100003', link: '/my-rewards/d' })
    expect(list[1]).toMatchObject({ title: 'Đã cộng +49 điểm', link: '/recycle/GP2', tone: 'positive' })
    expect(list[2].body).toContain('Rác bẩn hoặc ướt')
  })

  it('counts what is newer than the last visit', () => {
    expect(countUnread(list, '2026-10-30T08:00:00Z')).toBe(2)
    expect(countUnread(list, '2026-10-30T10:00:00Z')).toBe(0)
    expect(countUnread(list, undefined)).toBe(3)
  })
})
