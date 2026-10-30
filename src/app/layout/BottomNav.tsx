import { CircleDollarSign, House, List, Map as MapIcon, User, type LucideIcon } from 'lucide-react'
import { useMatches, useNavigate } from 'react-router-dom'
import { HistoryIcon, HouseFilledIcon } from '@/app/components/illustrations/small'
import { usePlatform } from '@/app/platform/PlatformContext'
import styles from './layout.module.css'

export type NavKind = 'citizen' | 'business'
export type TabId = 'home' | 'map' | 'history' | 'profile' | 'manage' | 'finance'
export interface RouteHandle {
  tab?: TabId
}

type IconComponent = LucideIcon | typeof HistoryIcon

interface NavItem {
  id: TabId
  label: string
  to: string
  Icon: IconComponent
  /** Glyph when active on iOS, as drawn in the mockup: solid fill, or fill with white inner lines. */
  fillActive: false | 'solid' | 'lines'
  /** Dedicated filled glyph when lucide's fill would hide inner details. */
  FilledIcon?: typeof HouseFilledIcon
}

const ITEMS: Record<NavKind, NavItem[]> = {
  citizen: [
    { id: 'home', label: 'Trang chủ', to: '/', Icon: House, fillActive: 'solid', FilledIcon: HouseFilledIcon },
    { id: 'map', label: 'Bản đồ', to: '/map', Icon: MapIcon, fillActive: 'lines' },
    { id: 'history', label: 'Lịch sử', to: '/history', Icon: HistoryIcon, fillActive: false },
    { id: 'profile', label: 'Cá nhân', to: '/profile', Icon: User, fillActive: 'solid' },
  ],
  // Q-08: tab 3 is "Tài chính" (GreenCapital); "Báo cáo" lives under Quản lý kho.
  business: [
    { id: 'home', label: 'Trang chủ', to: '/business', Icon: House, fillActive: 'solid', FilledIcon: HouseFilledIcon },
    { id: 'manage', label: 'Quản lý', to: '/business/manage', Icon: List, fillActive: false },
    { id: 'finance', label: 'Tài chính', to: '/business/capital', Icon: CircleDollarSign, fillActive: false },
    { id: 'profile', label: 'Cá nhân', to: '/business/profile', Icon: User, fillActive: 'solid' },
  ],
}

export function BottomNav({ kind }: { kind: NavKind }) {
  const platform = usePlatform()
  const navigate = useNavigate()
  const matches = useMatches()
  const active = [...matches].reverse().find((m) => (m.handle as RouteHandle | undefined)?.tab)
  const activeTab = (active?.handle as RouteHandle | undefined)?.tab

  return (
    <nav className={styles.nav} aria-label="Điều hướng chính">
      {ITEMS[kind].map(({ id, label, to, Icon, fillActive, FilledIcon }) => {
        const isActive = id === activeTab
        const filled = isActive && platform === 'ios' ? fillActive : false
        return (
          <button
            key={id}
            type="button"
            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => !isActive && navigate(to, { replace: true })}
          >
            <span className={styles.navIcon}>
              {filled && FilledIcon ? (
                <FilledIcon size={24} />
              ) : (
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  {...(filled === 'solid' ? { fill: 'currentColor' } : {})}
                  {...(filled === 'lines' ? { fill: 'currentColor', stroke: 'var(--c-surface)' } : {})}
                />
              )}
            </span>
            <span className={styles.navLabel}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
