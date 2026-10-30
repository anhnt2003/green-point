import { create } from 'zustand'

export type ToastTone = 'success' | 'error' | 'info'

export interface DialogAction {
  label: string
  value: string
  role?: 'cancel' | 'primary' | 'destructive'
}

interface DialogSpec {
  title: string
  message?: string
  actions: DialogAction[]
  resolve(value: string): void
}

interface FeedbackState {
  toast: { id: number; message: string; tone: ToastTone } | null
  dialog: DialogSpec | null
  showToast(message: string, tone?: ToastTone): void
  hideToast(): void
  openDialog(spec: Omit<DialogSpec, 'resolve'>): Promise<string>
  closeDialog(value: string): void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useFeedback = create<FeedbackState>()((set, get) => ({
  toast: null,
  dialog: null,

  showToast(message, tone = 'success') {
    clearTimeout(toastTimer)
    set({ toast: { id: Date.now(), message, tone } })
    toastTimer = setTimeout(() => get().hideToast(), 2600)
  },

  hideToast() {
    set({ toast: null })
  },

  openDialog(spec) {
    get().dialog?.resolve('cancel')
    return new Promise<string>((resolve) => set({ dialog: { ...spec, resolve } }))
  },

  closeDialog(value) {
    const dialog = get().dialog
    set({ dialog: null })
    dialog?.resolve(value)
  },
}))

export const toast = (message: string, tone?: ToastTone) => useFeedback.getState().showToast(message, tone)
export const openDialog = (spec: Omit<DialogSpec, 'resolve'>) => useFeedback.getState().openDialog(spec)
