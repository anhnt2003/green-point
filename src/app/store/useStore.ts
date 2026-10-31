import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ACCOUNTS, DEFAULT_COLLECTION_POINT_ID, WASTE_TYPES, createSeedState } from '@/app/data/seed'
import type { DataState, ExpenseCategory, LoanPurpose, Reward, Role, WasteCode, WasteItem } from '@/app/domain/types'
import { DATA_VERSION, migrateData } from './migrations'
import * as reducers from './reducers'

export const STORAGE_KEY = 'greenpoint:data'

interface Actions {
  login(username: string, password: string): { ok: true; role: Role } | { ok: false; error: 'INVALID_CREDENTIALS' }
  loginAs(role: Role): void
  logout(): void
  createRecycle(items: WasteItem[]): { ok: true; code: string } | { ok: false; error: string }
  /** Staff of the logged-in collection point weighs and confirms (F-07). */
  confirmRecycle(code: string, actualItems: WasteItem[]): { ok: true; points: number } | { ok: false; error: string }
  rejectRecycle(code: string, reason: string): { ok: true } | { ok: false; error: string }
  redeem(reward: Reward): { ok: true; transactionId: string } | { ok: false; error: 'INSUFFICIENT_POINTS' | 'UNKNOWN_USER' | 'NO_SESSION' }
  markRewardUsed(transactionId: string): void
  markNotificationsSeen(): void
  /** Staff of the logged-in collection point. */
  sellStock(input: { code: WasteCode; kg: number; priceVndPerKg: number; buyer: string }): { ok: true } | { ok: false; error: string }
  addExpense(input: { category: ExpenseCategory; amountVnd: number; note: string }): { ok: true } | { ok: false; error: string }
  createLoanApplication(purposes: LoanPurpose[]): { ok: true; id: string } | { ok: false; error: string }
  reset(): void
}

export type Store = DataState & Actions

const nowIso = () => new Date().toISOString()

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const data = (): DataState => {
        const { session, users, transactions, loanApplications, stockMoves, expenses, codeSeq } = get()
        return { session, users, transactions, loanApplications, stockMoves, expenses, codeSeq }
      }
      const userId = () => get().session?.userId

      return {
        ...createSeedState(),

        login(username, password) {
          const res = reducers.login(data(), ACCOUNTS, username, password)
          if (!res.ok) return res
          set(res.state)
          return { ok: true, role: res.user.role }
        },

        loginAs(role) {
          const user = Object.values(get().users).find((u) => u.role === role)
          if (user) set(reducers.loginAsUser(data(), user.id))
        },

        logout() {
          set(reducers.logout(data()))
        },

        createRecycle(items) {
          const userId = get().session?.userId
          if (!userId) return { ok: false, error: 'NO_SESSION' }
          const res = reducers.createRecycle(
            data(),
            { userId, items, collectionPointId: DEFAULT_COLLECTION_POINT_ID, now: nowIso() },
            WASTE_TYPES,
          )
          if (!res.ok) return res
          set(res.state)
          return { ok: true, code: res.transaction.code as string }
        },

        confirmRecycle(code, actualItems) {
          const staffUserId = get().session?.userId
          if (!staffUserId) return { ok: false, error: 'NO_SESSION' }
          const res = reducers.confirmRecycle(data(), { code, staffUserId, actualItems, now: nowIso() }, WASTE_TYPES)
          if (!res.ok) return res
          set(res.state)
          return { ok: true, points: res.transaction.points }
        },

        rejectRecycle(code, reason) {
          const staffUserId = get().session?.userId
          if (!staffUserId) return { ok: false, error: 'NO_SESSION' }
          const res = reducers.rejectRecycle(data(), { code, staffUserId, reason, now: nowIso() })
          if (!res.ok) return res
          set(res.state)
          return { ok: true }
        },

        redeem(reward) {
          const userId = get().session?.userId
          if (!userId) return { ok: false, error: 'NO_SESSION' }
          const res = reducers.redeemReward(data(), { userId, reward, now: nowIso() })
          if (!res.ok) return res
          set(res.state)
          return { ok: true, transactionId: res.transaction.id }
        },

        markRewardUsed(transactionId) {
          const id = userId()
          if (!id) return
          const res = reducers.markRewardUsed(data(), { userId: id, transactionId, now: nowIso() })
          if (res.ok) set(res.state)
        },

        markNotificationsSeen() {
          const id = userId()
          if (id) set(reducers.markNotificationsSeen(data(), { userId: id, now: nowIso() }))
        },

        sellStock(input) {
          const staffUserId = userId()
          if (!staffUserId) return { ok: false, error: 'NO_SESSION' }
          const res = reducers.sellStock(data(), { ...input, staffUserId, now: nowIso() })
          if (!res.ok) return res
          set(res.state)
          return { ok: true }
        },

        addExpense(input) {
          const staffUserId = userId()
          if (!staffUserId) return { ok: false, error: 'NO_SESSION' }
          const res = reducers.addExpense(data(), { ...input, staffUserId, now: nowIso() })
          if (!res.ok) return res
          set(res.state)
          return { ok: true }
        },

        createLoanApplication(purposes) {
          const userId = get().session?.userId
          if (!userId) return { ok: false, error: 'NO_SESSION' }
          const res = reducers.createLoanApplication(data(), { userId, purposes, now: nowIso() })
          if (!res.ok) return res
          set(res.state)
          return { ok: true, id: res.application.id }
        },

        reset() {
          set(createSeedState())
        },
      }
    },
    {
      name: STORAGE_KEY,
      version: DATA_VERSION,
      migrate: (persisted, version) => migrateData(persisted, version) as unknown as Store,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ session, users, transactions, loanApplications, stockMoves, expenses, codeSeq }) => ({
        session,
        users,
        transactions,
        loanApplications,
        stockMoves,
        expenses,
        codeSeq,
      }),
    },
  ),
)

// Keep several open tabs/iframes of the simulator in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) void useStore.persist.rehydrate()
  })
}
