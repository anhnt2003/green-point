import { Minus, Plus } from 'lucide-react'
import { WEIGHT_MAX, WEIGHT_MIN, WEIGHT_STEP, clampWeight } from '@/app/domain/points'
import { formatKgValue } from '@/app/domain/format'
import styles from './ui.module.css'

interface QuantityStepperProps {
  value: number
  onChange(value: number): void
  label: string
}

/** "−  2 kg  +" with 0.5 kg steps (BR-03). */
export function QuantityStepper({ value, onChange, label }: QuantityStepperProps) {
  return (
    <div className={styles.stepper} role="group" aria-label={`Khối lượng ${label}`}>
      <button
        type="button"
        className={`${styles.stepperButton} pressable`}
        onClick={() => onChange(clampWeight(value - WEIGHT_STEP))}
        disabled={value <= WEIGHT_MIN}
        aria-label={`Giảm ${label}`}
      >
        <Minus size={18} strokeWidth={2.4} />
      </button>
      <output className={styles.stepperValue} aria-live="polite">
        {formatKgValue(value)} kg
      </output>
      <button
        type="button"
        className={`${styles.stepperButton} pressable`}
        onClick={() => onChange(clampWeight(value + WEIGHT_STEP))}
        disabled={value >= WEIGHT_MAX}
        aria-label={`Tăng ${label}`}
      >
        <Plus size={18} strokeWidth={2.4} />
      </button>
    </div>
  )
}
