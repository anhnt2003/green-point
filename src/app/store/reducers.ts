/**
 * Pure state transitions. Every business rule lives here so it can be unit-tested
 * without React or localStorage. The zustand store only wires these to actions.
 */
import { calcPoints, sumWeights, totalWeight } from '@/app/domain/points'
import type {
  Account,
  DataState,
  LoanPurpose,
  Reward,
  Transaction,
  User,
  WasteItem,
  WasteType,
} from '@/app/domain/types'
import { CODE_BASE } from '@/app/data/seed'

export type Fail<E extends string> = { ok: false; error: E }
export type Ok<T> = { ok: true; state: DataState } & T

const fail = <E extends string>(error: E): Fail<E> => ({ ok: false, error })

export function login(
  state: DataState,
  accounts: readonly Account[],
  username: string,
  password: string,
): Ok<{ user: User }> | Fail<'INVALID_CREDENTIALS'> {
  const name = username.trim().toLowerCase()
  const account = accounts.find((a) => a.username === name && a.password === password)
  const user = account ? state.users[account.userId] : undefined
  if (!account || !user) return fail('INVALID_CREDENTIALS')
  return { ok: true, user, state: { ...state, session: { userId: user.id } } }
}

export function loginAsUser(state: DataState, userId: string): DataState {
  return state.users[userId] ? { ...state, session: { userId } } : state
}

export function logout(state: DataState): DataState {
  return { ...state, session: null }
}

/** BR-04: creates a pending transaction; the balance is untouched until confirmation. */
export function createRecycle(
  state: DataState,
  input: { userId: string; items: WasteItem[]; collectionPointId: string; now: string },
  types: readonly WasteType[],
): Ok<{ transaction: Transaction }> | Fail<'EMPTY' | 'UNKNOWN_USER'> {
  if (!state.users[input.userId]) return fail('UNKNOWN_USER')
  const items = input.items.filter((i) => i.weightKg > 0)
  if (items.length === 0 || totalWeight(items) <= 0) return fail('EMPTY')
  const code = `GP${CODE_BASE + state.codeSeq}`
  const transaction: Transaction = {
    id: `t-${code}`,
    userId: input.userId,
    type: 'recycle',
    status: 'pending',
    points: calcPoints(items, types),
    code,
    items,
    collectionPointId: input.collectionPointId,
    createdAt: input.now,
  }
  return {
    ok: true,
    transaction,
    state: { ...state, codeSeq: state.codeSeq + 1, transactions: [transaction, ...state.transactions] },
  }
}

/**
 * Staff confirmation (simulated). Idempotent: confirming twice credits once.
 * Credits the citizen and adds the weight to the collection point's business stats.
 */
export function confirmRecycle(state: DataState, code: string, now: string): DataState {
  const tx = state.transactions.find((t) => t.code === code)
  if (!tx || tx.type !== 'recycle' || tx.status !== 'pending') return state
  const citizen = state.users[tx.userId]
  if (!citizen) return state

  const weightByType = { ...citizen.weightByType }
  for (const item of tx.items ?? []) weightByType[item.code] += item.weightKg
  const addedKg = sumWeights(weightByType) - sumWeights(citizen.weightByType)

  const users: Record<string, User> = {
    ...state.users,
    [citizen.id]: { ...citizen, pointBalance: citizen.pointBalance + tx.points, weightByType },
  }
  const operator = Object.values(users).find((u) => u.collectionPointId === tx.collectionPointId && u.business)
  if (operator?.business) {
    users[operator.id] = {
      ...operator,
      business: {
        ...operator.business,
        ordersToday: operator.business.ordersToday + 1,
        totalWeightKg: operator.business.totalWeightKg + addedKg,
      },
    }
  }

  return {
    ...state,
    users,
    transactions: state.transactions.map((t) =>
      t.id === tx.id ? { ...t, status: 'confirmed' as const, confirmedAt: now } : t,
    ),
  }
}

/** BR-05: redeem deducts the reward price; rejected when the balance is too low. */
export function redeemReward(
  state: DataState,
  input: { userId: string; reward: Reward; now: string },
): Ok<{ transaction: Transaction }> | Fail<'INSUFFICIENT_POINTS' | 'UNKNOWN_USER'> {
  const user = state.users[input.userId]
  if (!user) return fail('UNKNOWN_USER')
  if (user.pointBalance < input.reward.points) return fail('INSUFFICIENT_POINTS')
  const transaction: Transaction = {
    id: `t-redeem-${state.transactions.length + 1}-${input.reward.id}`,
    userId: user.id,
    type: 'redeem',
    status: 'confirmed',
    points: -input.reward.points,
    rewardId: input.reward.id,
    createdAt: input.now,
    confirmedAt: input.now,
  }
  return {
    ok: true,
    transaction,
    state: {
      ...state,
      users: { ...state.users, [user.id]: { ...user, pointBalance: user.pointBalance - input.reward.points } },
      transactions: [transaction, ...state.transactions],
    },
  }
}

export function createLoanApplication(
  state: DataState,
  input: { userId: string; purposes: LoanPurpose[]; now: string },
): Ok<object> | Fail<'NO_PURPOSE'> {
  if (input.purposes.length === 0) return fail('NO_PURPOSE')
  const application = {
    id: `loan-${state.loanApplications.length + 1}`,
    userId: input.userId,
    purposes: [...input.purposes],
    createdAt: input.now,
    status: 'submitted' as const,
  }
  return { ok: true, state: { ...state, loanApplications: [application, ...state.loanApplications] } }
}

/** Pending recycle transactions older than `maxAgeMs` (used after a reload). */
export function stalePendingCodes(state: DataState, nowMs: number, maxAgeMs: number): string[] {
  return state.transactions
    .filter((t) => t.type === 'recycle' && t.status === 'pending' && t.code)
    .filter((t) => nowMs - new Date(t.createdAt).getTime() >= maxAgeMs)
    .map((t) => t.code as string)
}
