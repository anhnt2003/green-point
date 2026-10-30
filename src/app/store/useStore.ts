import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { ACCOUNTS, DEFAULT_COLLECTION_POINT_ID, WASTE_TYPES, createSeedState } from '@/app/data/seed'
import type { DataState, LoanPurpose, Reward, Role, WasteItem } from '@/app/domain/types'
import * as reducers from './reducers'

/** Simulated delay before the collection-point staff "confirms" a recycle transaction. */
export const CONFIRM_DELAY_MS = 2000
export const STORAGE_KEY = 'greenpoint:data'

interface Actions {
  login(username: string, password: string): { ok: true; role: Role } | { ok: false; error: 'INVALID_CREDENTIALS' }
  loginAs(role: Role): void
  logout(): void
  createRecycle(items: WasteItem[]): { ok: true; code: string } | { ok: false; error: string }
  confirmRecycle(code: string): void
  redeem(reward: Reward): { ok: true } | { ok: false; error: 'INSUFFICIENT_POINTS' | 'UNKNOWN_USER' | 'NO_SESSION' }
  createLoanApplication(purposes: LoanPurpose[]): { ok: true } | { ok: false; error: string }
  reset(): void
}

export type Store = DataState & Actions

const nowIso = () => new Date().toISOString()
const scheduled = new Set<string>()

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const data = (): DataState => {
        const { session, users, transactions, loanApplications, codeSeq } = get()
        return { session, users, transactions, loanApplications, codeSeq }
      }

      const scheduleConfirm = (code: string) => {
        if (scheduled.has(code)) return
        scheduled.add(code)
        setTimeout(() => {
          scheduled.delete(code)
          get().confirmRecycle(code)
        }, CONFIRM_DELAY_MS)
      }

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
          scheduleConfirm(res.transaction.code as string)
          return { ok: true, code: res.transaction.code as string }
        },

        confirmRecycle(code) {
          set(reducers.confirmRecycle(data(), code, nowIso()))
        },

        redeem(reward) {
          const userId = get().session?.userId
          if (!userId) return { ok: false, error: 'NO_SESSION' }
          const res = reducers.redeemReward(data(), { userId, reward, now: nowIso() })
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
          return { ok: true }
        },

        reset() {
          scheduled.clear()
          set(createSeedState())
        },
      }
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ session, users, transactions, loanApplications, codeSeq }) => ({
        session,
        users,
        transactions,
        loanApplications,
        codeSeq,
      }),
      // A reload while a confirmation was pending must not lose the points.
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const now = Date.now()
        const stale = reducers.stalePendingCodes(state, now, CONFIRM_DELAY_MS)
        stale.forEach((code) => state.confirmRecycle(code))
        state.transactions
          .filter((t) => t.status === 'pending' && t.code && !stale.includes(t.code))
          .forEach((t) => {
            const wait = Math.max(0, CONFIRM_DELAY_MS - (now - new Date(t.createdAt).getTime()))
            setTimeout(() => useStore.getState().confirmRecycle(t.code as string), wait)
          })
      },
    },
  ),
)

// Keep several open tabs/iframes of the simulator in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) void useStore.persist.rehydrate()
  })
}
