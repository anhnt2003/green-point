import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './ui.module.css'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  leading?: ReactNode
  trailing?: ReactNode
  invalid?: boolean
}

/** iOS: filled rounded field. Android: Material outlined field with the label on the border. */
export function TextField({ label, leading, trailing, invalid, className = '', ...rest }: TextFieldProps) {
  const id = useId()
  return (
    <div className={`${styles.field} ${invalid ? styles.fieldInvalid : ''} ${className}`}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      <div className={styles.fieldBox}>
        {leading && <span className={styles.fieldAdornment}>{leading}</span>}
        <input id={id} className={styles.fieldInput} aria-invalid={invalid || undefined} {...rest} />
        {trailing && <span className={styles.fieldAdornment}>{trailing}</span>}
      </div>
    </div>
  )
}
