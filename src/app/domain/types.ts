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

/** GreenBusiness dashboard figures, derived from the stock ledger (see domain/business.ts). */
export interface BusinessStats {
  /** All-time weight received. */
  totalWeightKg: number
  /** Weight received in the last 30 days vs the 30 days before. */
  monthOverMonthPct: number
  ordersToday: number
  /** Last 30 days of received weight at the recyclers' prices. */
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
  /** Citizen only: notifications up to this time have been seen. */
  notificationsSeenAt?: string
}

export type TransactionType = 'recycle' | 'redeem'
export type TransactionStatus = 'pending' | 'confirmed' | 'rejected'

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  status: TransactionStatus
  /**
   * Signed points: recycle = estimate while pending, actual once confirmed, 0 if rejected;
   * redeem = negative reward price.
   */
  points: number
  code?: string
  /** Recycle: the citizen's estimate while pending, the staff's scale weights once confirmed. */
  items?: WasteItem[]
  /** Recycle, after staff handling: what the citizen declared. */
  estimatedItems?: WasteItem[]
  estimatedPoints?: number
  /** Staff user who confirmed or rejected. */
  handledBy?: string
  rejectReason?: string
  collectionPointId?: string
  rewardId?: string
  /** Redeem: voucher code, or pickup code for a gift handed out at the collection point. */
  rewardCode?: string
  /** Redeem: when the voucher was used or the gift picked up. */
  usedAt?: string
  createdAt: string
  confirmedAt?: string
}

export type LoanPurpose = 'vehicle' | 'equipment' | 'expansion' | 'technology'

/** Activity report attached to a loan application, as of its creation (GreenCapital). */
export interface ActivityReport {
  periodDays: number
  intakeKg: number
  intakeByType: Record<WasteCode, number>
  orders: number
  salesVnd: number
  expensesVnd: number
  stockKg: number
  monthOverMonthPct: number
}

export interface LoanApplication {
  id: string
  userId: string
  purposes: LoanPurpose[]
  createdAt: string
  status: 'submitted'
  report: ActivityReport
}

/** One line of a collection point's stock ledger. */
export interface StockMove {
  id: string
  pointId: string
  /** in = received from a citizen, out = sold to a recycler. */
  kind: 'in' | 'out'
  code: WasteCode
  kg: number
  at: string
  /** in: groups the lines of one handover; the app transaction code when it came through the app. */
  orderId?: string
  /** in: points credited for this line. */
  points?: number
  /** out: buyer and agreed price. */
  buyer?: string
  priceVndPerKg?: number
}

/** Operating costs entered by the collection point. Points paid out are derived from the ledger. */
export type ExpenseCategory = 'transport' | 'labor' | 'utilities' | 'other'

export interface Expense {
  id: string
  pointId: string
  category: ExpenseCategory
  amountVnd: number
  note?: string
  at: string
}

export interface DataState {
  session: { userId: string } | null
  users: Record<string, User>
  transactions: Transaction[]
  loanApplications: LoanApplication[]
  stockMoves: StockMove[]
  expenses: Expense[]
  /** Next recycle code is `GP${CODE_BASE + codeSeq}`. */
  codeSeq: number
}
