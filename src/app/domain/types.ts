import type { Role } from '@/shared/bridge'

export type { Role }

export type WasteCode = 'paper' | 'pet' | 'aluminum'
export type WasteCategory = 'plastic' | 'paper' | 'metal'

export interface WasteType {
  code: WasteCode
  name: string
  pointsPerKg: number
  category: WasteCategory
}

export interface WasteItem {
  code: WasteCode
  weightKg: number
}

export interface CollectionPoint {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  accepts: WasteCategory[]
  openHours: string
}

export type RewardCategory = 'green_item' | 'voucher' | 'plant'
export type RewardThumbKind = 'bottle' | 'bag' | 'voucher' | 'plant'

export interface Reward {
  id: string
  name: string
  category: RewardCategory
  points: number
  partner?: string
  thumb: RewardThumbKind
}

export interface Account {
  username: string
  password: string
  userId: string
}

export interface BusinessStats {
  totalWeightKg: number
  monthOverMonthPct: number
  ordersToday: number
  estimatedRevenueVnd: number
}

export interface User {
  id: string
  role: Role
  name: string
  username: string
  avatarInitials: string
  /** Citizen only. Kept explicit: the mock balance does not equal the history sum (Q-07). */
  pointBalance: number
  /** Citizen only. Confirmed handed-over weight per waste type. */
  weightByType: Record<WasteCode, number>
  /** Business only: the collection point this account operates. */
  collectionPointId?: string
  business?: BusinessStats
}

export type TransactionType = 'recycle' | 'redeem'
export type TransactionStatus = 'pending' | 'confirmed'

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  status: TransactionStatus
  /** Signed: positive for recycle (estimated while pending), negative for redeem. */
  points: number
  code?: string
  items?: WasteItem[]
  collectionPointId?: string
  rewardId?: string
  createdAt: string
  confirmedAt?: string
}

export type LoanPurpose = 'vehicle' | 'equipment' | 'expansion' | 'technology'

export interface LoanApplication {
  id: string
  userId: string
  purposes: LoanPurpose[]
  createdAt: string
  status: 'submitted'
}

export interface DataState {
  session: { userId: string } | null
  users: Record<string, User>
  transactions: Transaction[]
  loanApplications: LoanApplication[]
  /** Next recycle code is `GP${CODE_BASE + codeSeq}`. */
  codeSeq: number
}
