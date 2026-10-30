import { describe, expect, it } from 'vitest'
import { createSeedState } from '@/app/data/seed'
import { migrateData } from './migrations'

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
    expect(migrateData(current, 2)).toEqual(current)
  })
})
