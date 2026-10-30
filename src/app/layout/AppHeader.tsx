import { ArrowLeft, Bell, ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/app/components/illustrations/Logo'
import { usePlatform } from '@/app/platform/PlatformContext'
import styles from './layout.module.css'

interface AppHeaderProps {
  title?: string
  /** iOS alignment as drawn in the mockup. Android is always left-aligned. */
  align?: 'center' | 'left'
  /** iOS back glyph. Android always uses the arrow. */
  backIcon?: 'chevron' | 'arrow'
  showBack?: boolean
  /** Where to go when there is no history to pop (e.g. opened from the shell). */
  fallback?: string
  right?: ReactNode
}

export function useBack(fallback = '/') {
  const navigate = useNavigate()
  const location = useLocation()
  // MemoryRouter gives the first entry the key "default": nothing to pop.
  return () => (location.key === 'default' ? navigate(fallback, { replace: true }) : navigate(-1))
}

export function AppHeader({
  title,
  align = 'center',
  backIcon = 'chevron',
  showBack = true,
  fallback = '/',
  right,
}: AppHeaderProps) {
  const platform = usePlatform()
  const back = useBack(fallback)
  const isAndroid = platform === 'android'
  const centered = !isAndroid && align === 'center'
  const BackGlyph = isAndroid || backIcon === 'arrow' ? ArrowLeft : ChevronLeft

  return (
    <header className={`${styles.header} ${centered ? styles.headerCenter : styles.headerLeft}`}>
      {showBack ? (
        <button type="button" className={`${styles.backButton} pressable`} onClick={back} aria-label="Quay lại">
          <BackGlyph size={isAndroid ? 24 : 26} strokeWidth={isAndroid ? 2 : 2.2} />
        </button>
      ) : (
        centered && <span className={styles.headerSpacer} />
      )}
      {title && <h1 className={styles.headerTitle}>{title}</h1>}
      {centered ? <span className={styles.headerSpacer}>{right}</span> : right}
    </header>
  )
}

/** Round icon button for the right side of AppHeader. */
export function HeaderAction({ label, onClick, children }: { label: string; onClick(): void; children: ReactNode }) {
  return (
    <button type="button" className={`${styles.iconButton} pressable`} onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  )
}

/** Home variant: leaf logo + brand on the left, bell and avatar on the right. */
export function HomeHeader({ initials, onAvatar }: { initials: string; onAvatar?: () => void }) {
  return (
    <header className={`${styles.header} ${styles.homeHeader}`}>
      <div className={styles.brand}>
        <Logo size={40} />
        <span className={styles.brandName}>GreenPoint</span>
      </div>
      <button type="button" className={`${styles.iconButton} pressable`} aria-label="Thông báo">
        <Bell size={24} strokeWidth={1.9} />
        <span className={styles.badgeDot} />
      </button>
      <button type="button" className={`${styles.avatar} pressable`} onClick={onAvatar} aria-label="Cá nhân">
        {initials}
      </button>
    </header>
  )
}
