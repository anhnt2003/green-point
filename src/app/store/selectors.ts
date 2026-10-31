import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { REWARDS } from '@/app/data/seed'
import { businessStats } from '@/app/domain/business'
import { countUnread, notificationsFor } from '@/app/domain/notifications'
import { impactEquivalents, sumWeights } from '@/app/domain/points'
import type { Expense, StockMove, Transaction, User } from '@/app/domain/types'
import { useStore } from './useStore'

export function useCurrentUser(): User | null {
  return useStore((s) => (s.session ? (s.users[s.session.userId] ?? null) : null))
}

export function useUserTransactions(): Transaction[] {
  return useStore(
    useShallow((s) => (s.session ? s.transactions.filter((t) => t.userId === s.session?.userId) : [])),
  )
}

export function useTransaction(code: string | undefined): Transaction | undefined {
  return useStore((s) => s.transactions.find((t) => t.code === code))
}

export function useCitizenStats() {
  const user = useCurrentUser()
  const transactions = useUserTransactions()
  const totalKg = user ? sumWeights(user.weightByType) : 0
  return {
    pointBalance: user?.pointBalance ?? 0,
    totalKg,
    transactionCount: transactions.filter((t) => t.status === 'confirmed').length,
    equivalents: impactEquivalents(totalKg),
    weightByType: user?.weightByType,
  }
}

/** Recycle transactions handed over at the logged-in staff member's collection point, newest first. */
export function usePointTransactions(status: 'pending' | 'handled'): Transaction[] {
  return useStore(
    useShallow((s) => {
      const pointId = s.session ? s.users[s.session.userId]?.collectionPointId : undefined
      if (!pointId) return []
      return s.transactions
        .filter((t) => t.type === 'recycle' && t.code && t.collectionPointId === pointId && t.items?.length)
        .filter((t) => (status === 'pending' ? t.status === 'pending' : t.status !== 'pending'))
        .sort((a, b) => (b.confirmedAt ?? b.createdAt).localeCompare(a.confirmedAt ?? a.createdAt))
    }),
  )
}

export function useUser(id: string | undefined): User | undefined {
  return useStore((s) => (id ? s.users[id] : undefined))
}

/** Rewards the citizen redeemed, newest first. */
export function useMyRewards(): Transaction[] {
  const transactions = useUserTransactions()
  return useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'redeem')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [transactions],
  )
}

export function useNotifications() {
  const seenAt = useCurrentUser()?.notificationsSeenAt
  const transactions = useUserTransactions()
  const list = useMemo(() => notificationsFor(transactions, REWARDS), [transactions])
  return { list, seenAt, unread: countUnread(list, seenAt) }
}

/** Stock ledger of the logged-in staff member's collection point, newest first. */
export function usePointMoves(): StockMove[] {
  return useStore(
    useShallow((s) => {
      const pointId = s.session ? s.users[s.session.userId]?.collectionPointId : undefined
      return pointId ? s.stockMoves.filter((m) => m.pointId === pointId) : []
    }),
  )
}

export function usePointExpenses(): Expense[] {
  return useStore(
    useShallow((s) => {
      const pointId = s.session ? s.users[s.session.userId]?.collectionPointId : undefined
      return pointId ? s.expenses.filter((e) => e.pointId === pointId) : []
    }),
  )
}

export function useBusinessStats() {
  const moves = usePointMoves()
  return useMemo(() => businessStats(moves, new Date()), [moves])
}
