import styles from './ui.module.css'

interface WeightFieldProps {
  value: string
  onChange(value: string): void
  label: string
  invalid?: boolean
}

/** Numeric field for a scale reading, with a fixed "kg" suffix. Accepts "2.4" or "2,4". */
export function WeightField({ value, onChange, label, invalid }: WeightFieldProps) {
  return (
    <label className={`${styles.weightField} ${invalid ? styles.weightFieldInvalid : ''}`}>
      <input
        className={styles.weightInput}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        aria-label={label}
        aria-invalid={invalid || undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
      />
      <span className={styles.weightUnit}>kg</span>
    </label>
  )
}
