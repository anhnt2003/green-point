import { formatPoints } from './format'
import type { Reward, Transaction } from './types'

export interface AppNotification {
  id: string
  at: string
  title: string
  body: string
  /** Screen that shows the details. */
  link?: string
  tone: 'positive' | 'negative' | 'info'
}

/**
 * The citizen's notifications, newest first, derived from their transactions:
 * a handover confirmed or rejected by the staff, and a reward redeemed.
 */
export function notificationsFor(transactions: readonly Transaction[], rewards: readonly Reward[]): AppNotification[] {
  const list: AppNotification[] = []
  for (const t of transactions) {
    const at = t.confirmedAt ?? t.createdAt
    const ref = t.code ? ` #${t.code}` : ''
    const link = t.code ? `/recycle/${t.code}` : undefined
    if (t.type === 'recycle' && t.status === 'confirmed') {
      list.push({
        id: `${t.id}:confirmed`,
        at,
        title: `Đã cộng ${formatPoints(t.points, true)}`,
        body: `Giao dịch đổi rác${ref} đã được điểm thu gom xác nhận.`,
        link,
        tone: 'positive',
      })
    } else if (t.type === 'recycle' && t.status === 'rejected') {
      list.push({
        id: `${t.id}:rejected`,
        at,
        title: `Giao dịch${ref} bị từ chối`,
        body: `Lý do: ${t.rejectReason ?? 'không rõ'}. Bạn có thể phân loại lại và tạo giao dịch mới.`,
        link,
        tone: 'negative',
      })
    } else if (t.type === 'redeem') {
      const reward = rewards.find((r) => r.id === t.rewardId)
      list.push({
        id: `${t.id}:redeemed`,
        at,
        title: 'Đổi quà thành công',
        body: `${reward?.name ?? 'Quà'}${t.rewardCode ? ` · mã ${t.rewardCode}` : ''}`,
        link: `/my-rewards/${t.id}`,
        tone: 'info',
      })
    }
  }
  return list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

/** Notifications newer than `seenAt`; all of them when the user has never opened the list. */
export function countUnread(list: readonly AppNotification[], seenAt: string | undefined): number {
  if (!seenAt) return list.length
  const seen = new Date(seenAt).getTime()
  return list.filter((n) => new Date(n.at).getTime() > seen).length
}
