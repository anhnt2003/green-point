import type {
  Account,
  CollectionPoint,
  DataState,
  LoanPurpose,
  Reward,
  Transaction,
  User,
  WasteCategory,
  WasteType,
} from '@/app/domain/types'

/** BR-02. */
export const WASTE_TYPES: readonly WasteType[] = [
  { code: 'paper', name: 'Giấy, bìa carton', pointsPerKg: 10, category: 'paper' },
  { code: 'pet', name: 'Chai nhựa (PET)', pointsPerKg: 15, category: 'plastic' },
  { code: 'aluminum', name: 'Lon nhôm', pointsPerKg: 20, category: 'metal' },
]

export const CATEGORY_LABEL: Record<WasteCategory, string> = {
  plastic: 'Nhựa',
  paper: 'Giấy',
  metal: 'Kim loại',
}

/**
 * Fallback when the real device location is unavailable (permission denied, no GPS,
 * insecure context): next to Hanoi University of Science and Technology, ~0.8 km from
 * Green-House as in the mockup.
 */
export const DEFAULT_LOCATION = { lat: 21.0068, lng: 105.8468 }

/** BR-09. Green-House is the nearest point (~0.8 km), as in the mockup. */
export const COLLECTION_POINTS: readonly CollectionPoint[] = [
  {
    id: 'green-house',
    name: 'Điểm thu gom Green-House',
    address: '123 Lê Thanh Nghị, Q. Hai Bà Trưng',
    lat: 21.0003,
    lng: 105.8448,
    accepts: ['plastic', 'paper', 'metal'],
    openHours: '7:00 - 19:00',
  },
  {
    id: 'bach-khoa-xanh',
    name: 'Điểm thu gom Bách Khoa Xanh',
    address: '1 Đại Cồ Việt, Q. Hai Bà Trưng',
    lat: 21.0072,
    lng: 105.8382,
    accepts: ['plastic', 'paper'],
    openHours: '7:30 - 17:30',
  },
  {
    id: 'thien-quang',
    name: 'Trạm tái chế Thiền Quang',
    address: '12 Trần Nhân Tông, Q. Hai Bà Trưng',
    lat: 21.015,
    lng: 105.848,
    accepts: ['paper', 'metal'],
    openHours: '8:00 - 18:00',
  },
  {
    id: 'ta-quang-buu',
    name: 'Điểm thu gom Tạ Quang Bửu',
    address: '40 Tạ Quang Bửu, Q. Hai Bà Trưng',
    lat: 20.9985,
    lng: 105.849,
    accepts: ['plastic', 'metal'],
    openHours: '6:30 - 20:00',
  },
  {
    id: 'bach-mai',
    name: 'Điểm thu gom Bạch Mai',
    address: '78 Bạch Mai, Q. Hai Bà Trưng',
    lat: 21.001,
    lng: 105.8545,
    accepts: ['plastic', 'paper', 'metal'],
    openHours: '7:00 - 21:00',
  },
  {
    id: 'minh-khai',
    name: 'Trạm tái chế Minh Khai',
    address: '200 Minh Khai, Q. Hai Bà Trưng',
    lat: 20.996,
    lng: 105.856,
    accepts: ['metal', 'paper'],
    openHours: '8:00 - 17:00',
  },
]

export const DEFAULT_COLLECTION_POINT_ID = 'green-house'

/** BR-06. Order follows the mockup. */
export const REWARDS: readonly Reward[] = [
  { id: 'bottle', name: 'Bình nước tái sử dụng', category: 'green_item', points: 200, thumb: 'bottle' },
  { id: 'canvas-bag', name: 'Túi vải canvas', category: 'green_item', points: 100, thumb: 'bag' },
  {
    id: 'highlands-voucher',
    name: 'Voucher Highlands Coffee',
    category: 'voucher',
    points: 150,
    partner: 'Highlands Coffee',
    thumb: 'voucher',
  },
  { id: 'mini-plant', name: 'Cây xanh mini', category: 'plant', points: 300, thumb: 'plant' },
]

export const LOAN_PURPOSES: readonly { id: LoanPurpose; label: string }[] = [
  { id: 'vehicle', label: 'Mua xe vận chuyển' },
  { id: 'equipment', label: 'Mua cân điện tử, thùng chứa' },
  { id: 'expansion', label: 'Mở rộng cơ sở thu gom' },
  { id: 'technology', label: 'Đầu tư công nghệ tái chế' },
]

/**
 * Mock credentials only — this is a front-end simulator, not real authentication.
 * Deliberately not a breached password: Chrome's leak check flags e.g. "123456" and opens a
 * tab-modal warning after login, which blocks the whole simulator tab.
 */
export const DEMO_PASSWORD = 'GreenPoint@2026'

export const ACCOUNTS: readonly Account[] = [
  { username: 'citizen', password: DEMO_PASSWORD, userId: 'u-citizen' },
  { username: 'business', password: DEMO_PASSWORD, userId: 'u-greenhouse' },
]

export const VERIFIED_RECYCLING_RATE = 0.8

/** First generated code is GP256789, matching screen 05 of the mockup. */
export const CODE_BASE = 256789

const SEED_USERS: Record<string, User> = {
  'u-citizen': {
    id: 'u-citizen',
    role: 'citizen',
    name: 'Tuấn Anh',
    username: 'citizen',
    avatarInitials: 'TA',
    pointBalance: 245,
    weightByType: { paper: 4.5, pet: 2.5, aluminum: 1.5 },
  },
  'u-greenhouse': {
    id: 'u-greenhouse',
    role: 'business',
    name: 'Green-House',
    username: 'business',
    avatarInitials: 'GH',
    pointBalance: 0,
    weightByType: { paper: 0, pet: 0, aluminum: 0 },
    collectionPointId: 'green-house',
    business: { totalWeightKg: 1250, monthOverMonthPct: 12, ordersToday: 15, estimatedRevenueVnd: 8_500_000 },
  },
}

const seedTx = (id: string, type: Transaction['type'], points: number, at: string): Transaction => ({
  id,
  userId: 'u-citizen',
  type,
  status: 'confirmed',
  points,
  createdAt: at,
  confirmedAt: at,
  ...(type === 'recycle' ? { collectionPointId: DEFAULT_COLLECTION_POINT_ID } : {}),
})

/** DESIGN.md §5 history, newest first. Balance 245 is kept as-is (Q-07). */
const SEED_TRANSACTIONS: Transaction[] = [
  seedTx('t-seed-1', 'recycle', 45, '2025-04-15T12:30:00'),
  { ...seedTx('t-seed-2', 'redeem', -200, '2025-04-10T10:15:00'), rewardId: 'bottle' },
  seedTx('t-seed-3', 'recycle', 30, '2025-04-05T14:20:00'),
  { ...seedTx('t-seed-4', 'redeem', -100, '2025-03-28T09:40:00'), rewardId: 'canvas-bag' },
  seedTx('t-seed-5', 'recycle', 60, '2025-03-20T16:10:00'),
  seedTx('t-seed-6', 'recycle', 25, '2025-03-15T11:05:00'),
]

export function createSeedState(): DataState {
  return structuredClone({
    session: null,
    users: SEED_USERS,
    transactions: SEED_TRANSACTIONS,
    loanApplications: [],
    codeSeq: 0,
  })
}
