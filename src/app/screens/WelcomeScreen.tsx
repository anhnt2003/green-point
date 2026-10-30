import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Logo } from '@/app/components/illustrations/Logo'
import { SplashScene } from '@/app/components/illustrations/SplashScene'
import styles from './WelcomeScreen.module.css'

/** Screen 01 — Splash / Onboarding. */
export function WelcomeScreen() {
  const navigate = useNavigate()
  return (
    <div className={`${styles.screen} page-enter-replace`}>
      <div className={styles.brand}>
        <Logo size={92} />
        <h1 className={styles.name}>GreenPoint</h1>
        <p className={styles.tagline}>Rác có giá trị, sống xanh có thưởng</p>
      </div>
      <div className={styles.scene}>
        <SplashScene className={styles.sceneSvg} />
      </div>
      <div className={styles.actions}>
        <Button onClick={() => navigate('/login')}>Bắt đầu</Button>
        <button type="button" className={`${styles.link} pressable`} onClick={() => navigate('/login')}>
          Đăng nhập
        </button>
      </div>
    </div>
  )
}
