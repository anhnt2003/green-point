import styles from './ui.module.css'

export interface ChipOption<T extends string> {
  value: T
  label: string
}

interface FilterChipsProps<T extends string> {
  options: readonly ChipOption<T>[]
  value: T
  onChange(value: NoInfer<T>): void
  /** `scroll`: horizontal chips (03, 06). `tabs`: equal-width segment row (07, 08). */
  variant?: 'scroll' | 'tabs'
  ariaLabel?: string
}

export function FilterChips<T extends string>({ options, value, onChange, variant = 'scroll', ariaLabel }: FilterChipsProps<T>) {
  return (
    <div className={`${styles.chips} ${variant === 'tabs' ? styles.chipsTabs : ''}`} role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`${styles.chip} ${selected ? styles.chipSelected : ''} pressable`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
