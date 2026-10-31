import { DAY_MS, SALE_PRICES, WINDOW_DAYS, startOfDay, stockByType } from '@/app/domain/business'
import { linePoints } from '@/app/domain/points'
import type {
  Account,
  CollectionPoint,
  DataState,
  Expense,
  ExpenseCategory,
  LoanPurpose,
  Reward,
  StockMove,
  Transaction,
  User,
  WasteCategory,
  WasteCode,
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

/** Who buys sorted waste from a collection point, by type. Default buyer when selling. */
export const RECYCLERS: Record<WasteCode, string> = {
  paper: 'Đối tác tái chế giấy',
  pet: 'Đối tác tái chế nhựa',
  aluminum: 'Đối tác tái chế kim loại',
}

export const EXPENSE_CATEGORIES: readonly { id: ExpenseCategory; label: string }[] = [
  { id: 'transport', label: 'Vận chuyển' },
  { id: 'labor', label: 'Nhân công' },
  { id: 'utilities', label: 'Điện nước, mặt bằng' },
  { id: 'other', label: 'Khác' },
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
    notificationsSeenAt: '2025-04-15T12:30:00',
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
  {
    ...seedTx('t-seed-2', 'redeem', -200, '2025-04-10T10:15:00'),
    rewardId: 'bottle',
    rewardCode: 'GQ100002',
    usedAt: '2025-04-11T17:20:00',
  },
  seedTx('t-seed-3', 'recycle', 30, '2025-04-05T14:20:00'),
  {
    ...seedTx('t-seed-4', 'redeem', -100, '2025-03-28T09:40:00'),
    rewardId: 'canvas-bag',
    rewardCode: 'GQ100001',
    usedAt: '2025-03-29T08:05:00',
  },
  seedTx('t-seed-5', 'recycle', 60, '2025-03-20T16:10:00'),
  seedTx('t-seed-6', 'recycle', 25, '2025-03-15T11:05:00'),
]

/**
 * Weight Green-House received per 30-day window, chosen so the dashboard opens as in the
 * mockup: 1.250 kg in total, +12% on the previous month, ~8.5 million estimated revenue.
 */
const SEED_INTAKE: Record<'last' | 'previous', Record<WasteCode, number>> = {
  last: { paper: 329, pet: 190, aluminum: 141 },
  previous: { paper: 300, pet: 170, aluminum: 120 },
}
/** The mockup's "Đơn hàng hôm nay". */
const SEED_ORDERS_TODAY = 15

/**
 * Green-House's last 60 days relative to `now`: walk-in handovers, a weekly sale of most of
 * the stock to recyclers, and running costs. Deterministic for a given `now`.
 */
export function seedLedger(now: Date): Pick<DataState, 'stockMoves' | 'expenses'> {
  const pointId = DEFAULT_COLLECTION_POINT_ID
  const today = startOfDay(now)
  const dayAt = (daysAgo: number, hours: number) => new Date(today.getTime() - daysAgo * DAY_MS + hours * 3_600_000)
  const lastFrom = now.getTime() - WINDOW_DAYS * DAY_MS

  // Handovers: 10–18 a day between 7:00 and 19:00, the 15 of today in the last few hours.
  const intake: StockMove[] = []
  for (let d = 2 * WINDOW_DAYS - 1; d >= 0; d--) {
    const count = d === 0 ? SEED_ORDERS_TODAY : 10 + ((d * 37) % 9)
    for (let i = 0; i < count; i++) {
      const r = (d * 31 + i * 17) % 100
      const code: WasteCode = r < 50 ? 'paper' : r < 79 ? 'pet' : 'aluminum'
      const at = d === 0 ? new Date(now.getTime() - (count - i) * 12 * 60_000) : dayAt(d, 7 + (12 * i) / count)
      intake.push({
        id: `seed-in-${d}-${i}`,
        pointId,
        kind: 'in',
        code,
        kg: 0.5 + ((d * 13 + i * 29) % 26) / 10,
        at: at.toISOString(),
        orderId: `seed-${d}-${i}`,
      })
    }
  }
  // Scale each window and type to its target, in 0.1 kg, putting the rounding rest on the largest line.
  for (const window of ['last', 'previous'] as const) {
    for (const code of Object.keys(SEED_INTAKE[window]) as WasteCode[]) {
      const lines = intake.filter((m) => m.code === code && (new Date(m.at).getTime() > lastFrom) === (window === 'last'))
      const target = SEED_INTAKE[window][code]
      const raw = lines.reduce((s, m) => s + m.kg, 0)
      for (const m of lines) m.kg = Math.max(0.1, Math.round((m.kg * target * 10) / raw) / 10)
      const largest = lines.reduce((a, b) => (b.kg > a.kg ? b : a))
      largest.kg = Math.round((largest.kg + target - lines.reduce((s, m) => s + m.kg, 0)) * 10) / 10
    }
  }
  for (const m of intake) m.points = linePoints({ code: m.code, weightKg: m.kg }, WASTE_TYPES)

  // Every 7 days at 16:00, sell 90% of the stock (whole kg) and pay for the truck.
  const moves = [...intake]
  const expenses: Expense[] = []
  const expense = (id: string, daysAgo: number, category: ExpenseCategory, amountVnd: number, note: string) =>
    expenses.push({ id: `seed-exp-${id}`, pointId, category, amountVnd, note, at: dayAt(daysAgo, 17).toISOString() })
  for (let d = 56; d > 0; d -= 7) {
    const at = dayAt(d, 16)
    const stock = stockByType(moves.filter((m) => new Date(m.at) < at))
    for (const code of Object.keys(stock) as WasteCode[]) {
      const kg = Math.floor(stock[code] * 0.9)
      if (kg <= 0) continue
      moves.push({
        id: `seed-out-${d}-${code}`,
        pointId,
        kind: 'out',
        code,
        kg,
        at: at.toISOString(),
        buyer: RECYCLERS[code],
        priceVndPerKg: SALE_PRICES[code],
      })
    }
    expense(`truck-${d}`, d, 'transport', 200_000, 'Thuê xe chở hàng đi bán')
  }
  for (const d of [45, 15]) {
    expense(`labor-${d}`, d, 'labor', 3_500_000, 'Lương nhân viên phân loại')
    expense(`rent-${d}`, d + 5, 'utilities', 1_500_000, 'Tiền mặt bằng, điện nước')
  }
  expense('supplies', 33, 'other', 350_000, 'Bao tải, găng tay')

  return {
    stockMoves: moves.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    expenses: expenses.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
  }
}

export function createSeedState(now = new Date()): DataState {
  return structuredClone({
    session: null,
    users: SEED_USERS,
    transactions: SEED_TRANSACTIONS,
    loanApplications: [],
    ...seedLedger(now),
    codeSeq: 0,
  })
}
