import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Logo } from '@/app/components/illustrations/Logo'
import { TextField } from '@/app/components/TextField'
import { DEMO_PASSWORD } from '@/app/data/seed'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useStore } from '@/app/store/useStore'
import styles from './LoginScreen.module.css'

/** Basic account/password login (not in the mockup; built from the design tokens). */
export function LoginScreen() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const res = login(username, password)
    if (!res.ok) {
      setError('Tài khoản hoặc mật khẩu không đúng')
      return
    }
    navigate(res.role === 'business' ? '/business' : '/', { replace: true })
  }

  const fill = (user: string) => {
    setUsername(user)
    setPassword(DEMO_PASSWORD)
    setError(null)
  }

  return (
    <Screen header={<AppHeader fallback="/welcome" />}>
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.brand}>
          <Logo size={64} />
          <h1 className={styles.title}>Đăng nhập</h1>
          <p className={styles.subtitle}>Chào mừng bạn trở lại GreenPoint</p>
        </div>

        <TextField
          label="Tài khoản"
          placeholder="Nhập tên tài khoản"
          autoComplete="username"
          autoCapitalize="none"
          value={username}
          invalid={!!error}
          leading={<User size={20} />}
          onChange={(e) => {
            setUsername(e.target.value)
            setError(null)
          }}
        />
        <TextField
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          invalid={!!error}
          leading={<Lock size={20} />}
          trailing={
            <button
              type="button"
              className={styles.eye}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
          onChange={(e) => {
            setPassword(e.target.value)
            setError(null)
          }}
        />

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={!username.trim() || !password}>
          Đăng nhập
        </Button>

        <div className={styles.demo}>
          <span className={styles.demoTitle}>Tài khoản demo · mật khẩu {DEMO_PASSWORD}</span>
          <div className={styles.demoRow}>
            <button type="button" className={`${styles.demoChip} pressable`} onClick={() => fill('citizen')}>
              citizen · Người dân
            </button>
            <button type="button" className={`${styles.demoChip} pressable`} onClick={() => fill('business')}>
              business · Điểm thu gom
            </button>
          </div>
        </div>
      </form>
    </Screen>
  )
}
