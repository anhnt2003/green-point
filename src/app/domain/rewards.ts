import type { Reward } from './types'

/** First reward code is GQ100001 / GV100001. */
const REWARD_CODE_BASE = 100_000

/**
 * Code the citizen shows to claim a reward: GV… for a partner voucher, GQ… for a gift
 * picked up at the collection point. `seq` is the 1-based number of the redemption.
 */
export function rewardCode(reward: Reward, seq: number): string {
  return `${reward.category === 'voucher' ? 'GV' : 'GQ'}${REWARD_CODE_BASE + seq}`
}

/** Vouchers are used at the partner; gifts and plants are picked up at the collection point. */
export const isVoucher = (reward: Reward) => reward.category === 'voucher'
