import type { HTMLAttributes } from 'react'
import styles from './ui.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'surface' | 'tint' | 'tint-strong' | 'primary'
  radius?: 'md' | 'lg'
  padded?: boolean
}

export function Card({ tone = 'surface', radius = 'md', padded = true, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[`card_${tone}`]} ${radius === 'lg' ? styles.cardLg : ''} ${
        padded ? styles.cardPadded : ''
      } ${className}`}
      {...rest}
    />
  )
}
