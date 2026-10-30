import { ChartColumn, ClipboardList, HandCoins, Package, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { SectionTitle } from '@/app/components/SectionTitle'
import { StatCard } from '@/app/components/StatCard'
import { formatInt, formatKg, formatMillions } from '@/app/domain/format'
import { Screen } from '@/app/layout/Screen'
import { useCurrentUser } from '@/app/store/selectors'
import common from '../common.module.css'
import styles from './Business.module.css'

export const WAREHOUSE_TILES = [
  { label: 'Tồn kho', to: '/business/inventory', Icon: Package },
  { label: 'Đơn hàng', to: '/business/manage', Icon: ClipboardList },
  { label: 'Báo cáo', to: '/business/reports', Icon: ChartColumn },
] as const

/** Screen 09 — GreenBusiness dashboard. */
export function BusinessHomeScreen() {
  const navigate = useNavigate()
  const stats = useCurrentUser()?.business

  if (!stats) return null

  return (
    <Screen>
      <div className={common.content}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>GreenBusiness</h1>
          <p className={styles.subtitle}>Dành cho điểm thu gom &amp; doanh nghiệp</p>
        </div>

        <Card radius="lg" className={styles.totalCard}>
          <span className={styles.totalLabel}>Tổng khối lượng thu gom</span>
          <span className={styles.totalValue}>{formatKg(stats.totalWeightKg)}</span>
          <TrendingUp size={40} strokeWidth={2} className={styles.trend} />
          <span className={styles.delta}>
            <span className={styles.deltaDot}>
              <TrendingUp size={10} strokeWidth={3} />
            </span>
            <b>+{stats.monthOverMonthPct}%</b> so với tháng trước
          </span>
        </Card>

        <div className={common.row2}>
          <StatCard label="Đơn hàng hôm nay" value={formatInt(stats.ordersToday)} tone="primary" />
          <StatCard label="Doanh thu ước tính" value={formatMillions(stats.estimatedRevenueVnd)} tone="primary" />
        </div>

        <div className={styles.section}>
          <SectionTitle>Quản lý kho</SectionTitle>
        </div>
        <div className={styles.tiles}>
          {WAREHOUSE_TILES.map(({ label, to, Icon }) => (
            <button key={to} type="button" className={`${styles.tile} pressable`} onClick={() => navigate(to)}>
              <Icon size={28} strokeWidth={2.2} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <Card tone="tint-strong" radius="lg" className={styles.banner}>
          <div className={styles.bannerHead}>
            <span className={styles.bannerIcon}>
              <HandCoins size={18} strokeWidth={2.2} />
            </span>
            <span className={styles.bannerTitle}>Kết nối tín dụng xanh</span>
          </div>
          <p className={styles.bannerText}>
            Tạo hồ sơ hoạt động để tiếp cận nguồn vốn ưu đãi từ ngân hàng, tổ chức tài chính.
          </p>
          <Button size="md" block={false} onClick={() => navigate('/business/capital')}>
            Tìm hiểu thêm
          </Button>
        </Card>
      </div>
    </Screen>
  )
}
