/**
 * Pure state transitions. Every business rule lives here so it can be unit-tested
 * without React or localStorage. The zustand store only wires these to actions.
 */
import { activityReport, stockByType } from '@/app/domain/business'
import { calcPoints, linePoints, totalWeight } from '@/app/domain/points'
import { rewardCode } from '@/app/domain/rewards'
import type {
  Account,
  DataState,
  ExpenseCategory,
  LoanApplication,
  LoanPurpose,
  Reward,
  StockMove,
  Transaction,
  User,
  WasteCode,
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
 * the citizen once and books the weight into the collection point's stock.
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

  const users: Record<string, User> = {
    ...state.users,
    [citizen.id]: { ...citizen, pointBalance: citizen.pointBalance + points, weightByType },
  }
  const received: StockMove[] = items.map((item) => ({
    id: `in-${tx.code}-${item.code}`,
    pointId: tx.collectionPointId as string,
    kind: 'in',
    code: item.code,
    kg: item.weightKg,
    at: input.now,
    orderId: tx.code,
    points: linePoints(item, types),
  }))

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
    state: {
      ...state,
      users,
      transactions: state.transactions.map((t) => (t.id === tx.id ? transaction : t)),
      stockMoves: [...received, ...state.stockMoves],
    },
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
  const seq = state.transactions.filter((t) => t.type === 'redeem').length + 1
  const transaction: Transaction = {
    id: `t-redeem-${state.transactions.length + 1}-${input.reward.id}`,
    userId: user.id,
    type: 'redeem',
    status: 'confirmed',
    points: -input.reward.points,
    rewardId: input.reward.id,
    rewardCode: rewardCode(input.reward, seq),
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

/** The citizen marks a voucher as used or a gift as picked up. */
export function markRewardUsed(
  state: DataState,
  input: { userId: string; transactionId: string; now: string },
): Ok<object> | Fail<'NOT_FOUND' | 'ALREADY_USED'> {
  const tx = state.transactions.find((t) => t.id === input.transactionId && t.type === 'redeem' && t.userId === input.userId)
  if (!tx) return fail('NOT_FOUND')
  if (tx.usedAt) return fail('ALREADY_USED')
  return {
    ok: true,
    state: { ...state, transactions: state.transactions.map((t) => (t === tx ? { ...t, usedAt: input.now } : t)) },
  }
}

export function markNotificationsSeen(state: DataState, input: { userId: string; now: string }): DataState {
  const user = state.users[input.userId]
  return user ? { ...state, users: { ...state.users, [user.id]: { ...user, notificationsSeenAt: input.now } } } : state
}

/** The ledger lines of the collection point this staff member operates. */
const ledgerOf = (state: DataState, staffUserId: string) => {
  const pointId = state.users[staffUserId]?.collectionPointId
  return pointId
    ? {
        pointId,
        moves: state.stockMoves.filter((m) => m.pointId === pointId),
        expenses: state.expenses.filter((e) => e.pointId === pointId),
      }
    : null
}

/** Sells sorted waste from stock to a recycler: the revenue side of the collection point. */
export function sellStock(
  state: DataState,
  input: { staffUserId: string; code: WasteCode; kg: number; priceVndPerKg: number; buyer: string; now: string },
): Ok<object> | Fail<'NO_POINT' | 'INVALID' | 'NOT_ENOUGH_STOCK'> {
  const ledger = ledgerOf(state, input.staffUserId)
  if (!ledger) return fail('NO_POINT')
  if (!(input.kg > 0) || !(input.priceVndPerKg > 0) || !input.buyer.trim()) return fail('INVALID')
  if (input.kg > stockByType(ledger.moves)[input.code] + 1e-9) return fail('NOT_ENOUGH_STOCK')
  const sale: StockMove = {
    id: `out-${state.stockMoves.length + 1}`,
    pointId: ledger.pointId,
    kind: 'out',
    code: input.code,
    kg: round1(input.kg),
    at: input.now,
    buyer: input.buyer.trim(),
    priceVndPerKg: Math.round(input.priceVndPerKg),
  }
  return { ok: true, state: { ...state, stockMoves: [sale, ...state.stockMoves] } }
}

/** F-12: an operating cost of the collection point. */
export function addExpense(
  state: DataState,
  input: { staffUserId: string; category: ExpenseCategory; amountVnd: number; note: string; now: string },
): Ok<object> | Fail<'NO_POINT' | 'INVALID'> {
  const ledger = ledgerOf(state, input.staffUserId)
  if (!ledger) return fail('NO_POINT')
  if (!(input.amountVnd > 0)) return fail('INVALID')
  const expense = {
    id: `exp-${state.expenses.length + 1}`,
    pointId: ledger.pointId,
    category: input.category,
    amountVnd: Math.round(input.amountVnd),
    note: input.note.trim() || undefined,
    at: input.now,
  }
  return { ok: true, state: { ...state, expenses: [expense, ...state.expenses] } }
}

/** GreenCapital: the application carries an activity report of the last 30 days (TL #6). */
export function createLoanApplication(
  state: DataState,
  input: { userId: string; purposes: LoanPurpose[]; now: string },
): Ok<{ application: LoanApplication }> | Fail<'NO_PURPOSE' | 'NO_POINT'> {
  if (input.purposes.length === 0) return fail('NO_PURPOSE')
  const ledger = ledgerOf(state, input.userId)
  if (!ledger) return fail('NO_POINT')
  const application: LoanApplication = {
    id: `loan-${state.loanApplications.length + 1}`,
    userId: input.userId,
    purposes: [...input.purposes],
    createdAt: input.now,
    status: 'submitted',
    report: activityReport(ledger.moves, ledger.expenses, new Date(input.now)),
  }
  return { ok: true, application, state: { ...state, loanApplications: [application, ...state.loanApplications] } }
}
