import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './ui.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'white' | 'outline' | 'danger'
  size?: 'lg' | 'md' | 'sm'
  block?: boolean
  icon?: ReactNode
}

/** PrimaryButton (lg): primary background, white SemiBold 16, height 48, pill. */
export function Button({
  variant = 'primary',
  size = 'lg',
  block = size === 'lg',
  icon,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[`btn_${variant}`]} ${styles[`btn_${size}`]} ${
        block ? styles.btnBlock : ''
      } pressable ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
