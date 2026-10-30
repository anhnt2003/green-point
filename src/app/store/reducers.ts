/**
 * Pure state transitions. Every business rule lives here so it can be unit-tested
 * without React or localStorage. The zustand store only wires these to actions.
 */
import { calcPoints, totalWeight } from '@/app/domain/points'
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

export type HandleError = 'NOT_FOUND' | 'NOT_PENDING' | 'OTHER_POINT'

/** Finds a pending recycle transaction that this staff member's collection point may handle. */
function pendingFor(state: DataState, code: string, staffUserId: string): Transaction | HandleError {
  const tx = state.transactions.find((t) => t.type === 'recycle' && t.code === code)
  if (!tx || !state.users[tx.userId]) return 'NOT_FOUND'
  if (tx.status !== 'pending') return 'NOT_PENDING'
  if (state.users[staffUserId]?.collectionPointId !== tx.collectionPointId) return 'OTHER_POINT'
  return tx
}

/**
 * BR-04 + F-07: the staff weighs the waste and confirms. Points are computed from the
 * actual scale weights (BR-01); the citizen's estimate is kept for reference. Credits
 * the citizen once and adds the weight to the collection point's business stats.
 */
export function confirmRecycle(
  state: DataState,
  input: { code: string; staffUserId: string; actualItems: WasteItem[]; now: string },
  types: readonly WasteType[],
): Ok<{ transaction: Transaction }> | Fail<HandleError | 'EMPTY'> {
  const tx = pendingFor(state, input.code, input.staffUserId)
  if (typeof tx === 'string') return fail(tx)
  const items = input.actualItems.filter((i) => i.weightKg > 0)
  if (items.length === 0) return fail('EMPTY')

  const citizen = state.users[tx.userId]
  const points = calcPoints(items, types)
  const weightByType = { ...citizen.weightByType }
  for (const item of items) weightByType[item.code] = round1(weightByType[item.code] + item.weightKg)
  const addedKg = totalWeight(items)

  const users: Record<string, User> = {
    ...state.users,
    [citizen.id]: { ...citizen, pointBalance: citizen.pointBalance + points, weightByType },
  }
  const operator = users[input.staffUserId]
  if (operator.business) {
    users[operator.id] = {
      ...operator,
      business: {
        ...operator.business,
        ordersToday: operator.business.ordersToday + 1,
        totalWeightKg: round1(operator.business.totalWeightKg + addedKg),
      },
    }
  }

  const transaction: Transaction = {
    ...tx,
    status: 'confirmed',
    items,
    points,
    estimatedItems: tx.items,
    estimatedPoints: tx.points,
    handledBy: input.staffUserId,
    confirmedAt: input.now,
  }
  return {
    ok: true,
    transaction,
    state: { ...state, users, transactions: state.transactions.map((t) => (t.id === tx.id ? transaction : t)) },
  }
}

/** F-07: the staff refuses the handover (e.g. unsorted or dirty waste). No points are credited. */
export function rejectRecycle(
  state: DataState,
  input: { code: string; staffUserId: string; reason: string; now: string },
): Ok<{ transaction: Transaction }> | Fail<HandleError> {
  const tx = pendingFor(state, input.code, input.staffUserId)
  if (typeof tx === 'string') return fail(tx)
  const transaction: Transaction = {
    ...tx,
    status: 'rejected',
    points: 0,
    estimatedItems: tx.items,
    estimatedPoints: tx.points,
    handledBy: input.staffUserId,
    rejectReason: input.reason,
    confirmedAt: input.now,
  }
  return {
    ok: true,
    transaction,
    state: { ...state, transactions: state.transactions.map((t) => (t.id === tx.id ? transaction : t)) },
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10

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
