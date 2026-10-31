import { REWARDS, WASTE_TYPES, seedLedger } from '@/app/data/seed'
import { activityReport } from '@/app/domain/business'
import { linePoints } from '@/app/domain/points'
import { rewardCode } from '@/app/domain/rewards'
import type { DataState, LoanApplication, StockMove, Transaction, User } from '@/app/domain/types'

/** Bump when the persisted shape or seed identities change, and add a step below. */
export const DATA_VERSION = 3

const OLD_CITIZEN_ID = 'u-lananh'
const CITIZEN_ID = 'u-citizen'

/**
 * Upgrades data saved in localStorage by an older version of the app, so returning
 * visitors keep their points and history.
 */
export function migrateData(persisted: unknown, fromVersion: number): DataState {
  let state = persisted as DataState

  if (fromVersion < 2) {
    // v2: the mock citizen "Lan Anh" (u-lananh) became "Tuấn Anh" (u-citizen).
    const old = state.users?.[OLD_CITIZEN_ID]
    if (old) {
      const { [OLD_CITIZEN_ID]: _removed, ...others } = state.users
      const citizen: User = {
        ...old,
        id: CITIZEN_ID,
        name: old.name === 'Lan Anh' ? 'Tuấn Anh' : old.name,
        avatarInitials: old.avatarInitials === 'LA' ? 'TA' : old.avatarInitials,
      }
      const remap = (id: string) => (id === OLD_CITIZEN_ID ? CITIZEN_ID : id)
      state = {
        ...state,
        session: state.session ? { userId: remap(state.session.userId) } : null,
        users: { ...others, [CITIZEN_ID]: citizen },
        transactions: state.transactions.map((t) => ({ ...t, userId: remap(t.userId) })),
        loanApplications: state.loanApplications.map((l) => ({ ...l, userId: remap(l.userId) })),
      }
    }
  }

  if (fromVersion < 3) state = toV3(state as V2State, new Date())

  return state
}

type V2State = Omit<DataState, 'stockMoves' | 'expenses' | 'loanApplications'> & {
  users: Record<string, User & { business?: unknown }>
  loanApplications: Omit<LoanApplication, 'report'>[]
}

/**
 * v3: business figures come from a stock ledger instead of fixed numbers, redeemed rewards
 * get a code, and citizens get notifications.
 */
function toV3(state: V2State, now: Date): DataState {
  // Seed history, plus what staff already confirmed through the app.
  const ledger = seedLedger(now)
  const received: StockMove[] = state.transactions.flatMap((t) =>
    t.type === 'recycle' && t.status === 'confirmed' && t.code && t.collectionPointId
      ? (t.items ?? []).map((item) => ({
          id: `in-${t.code}-${item.code}`,
          pointId: t.collectionPointId as string,
          kind: 'in' as const,
          code: item.code,
          kg: item.weightKg,
          at: t.confirmedAt ?? t.createdAt,
          orderId: t.code,
          points: linePoints(item, WASTE_TYPES),
        }))
      : [],
  )
  const stockMoves = [...received, ...ledger.stockMoves]

  // Codes in redemption order; the seed's old gifts were picked up long ago.
  const redeems = state.transactions
    .filter((t) => t.type === 'redeem')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const transactions = state.transactions.map((t): Transaction => {
    const reward = REWARDS.find((r) => r.id === t.rewardId)
    if (t.type !== 'redeem' || t.rewardCode || !reward) return t
    const code = rewardCode(reward, redeems.indexOf(t) + 1)
    return { ...t, rewardCode: code, ...(t.id.startsWith('t-seed-') ? { usedAt: t.confirmedAt ?? t.createdAt } : {}) }
  })

  // Earlier events count as seen, so returning users do not get a pile of old notifications.
  const users: Record<string, User> = {}
  for (const { business: _removed, ...user } of Object.values(state.users)) {
    users[user.id] = user.role === 'citizen' && !user.notificationsSeenAt ? { ...user, notificationsSeenAt: now.toISOString() } : user
  }

  const loanApplications = state.loanApplications.map((l): LoanApplication => {
    const pointId = users[l.userId]?.collectionPointId
    const moves = stockMoves.filter((m) => m.pointId === pointId)
    const expenses = ledger.expenses.filter((e) => e.pointId === pointId)
    return { ...l, report: activityReport(moves, expenses, new Date(l.createdAt)) }
  })

  return { ...state, users, transactions, loanApplications, stockMoves, expenses: ledger.expenses }
}
