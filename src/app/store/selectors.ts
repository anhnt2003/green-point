import { useShallow } from 'zustand/react/shallow'
import { impactEquivalents, sumWeights } from '@/app/domain/points'
import type { Transaction, User } from '@/app/domain/types'
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
