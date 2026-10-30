import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

/**
 * - `starting`: asking for the camera.
 * - `scanning`: camera on, decoding frames.
 * - `denied`: the user refused camera access.
 * - `unavailable`: no camera, insecure context (http on a LAN address) or unsupported browser.
 */
export type CameraStatus = 'starting' | 'scanning' | 'denied' | 'unavailable'

/** Minimal typing for the Shape Detection API (Chrome, Edge, Android); not in lib.dom yet. */
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>
}
interface BarcodeDetectorCtor {
  new (options: { formats: string[] }): BarcodeDetectorLike
  getSupportedFormats(): Promise<string[]>
}

type Decoder = (video: HTMLVideoElement) => Promise<string | null>

const SCAN_INTERVAL_MS = 150
/** The same QR seen again within this window is ignored. */
const REPEAT_WINDOW_MS = 2500
const MAX_DECODE_WIDTH = 640

async function createDecoder(): Promise<Decoder> {
  const Native = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector
  if (Native && (await Native.getSupportedFormats().catch((): string[] => [])).includes('qr_code')) {
    const detector = new Native({ formats: ['qr_code'] })
    return async (video) => (await detector.detect(video))[0]?.rawValue ?? null
  }
  // Safari / desktop browsers without BarcodeDetector: decode frames in JS (loaded on demand).
  const { default: jsQR } = await import('jsqr')
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  return async (video) => {
    if (!ctx || !video.videoWidth) return null
    const scale = Math.min(1, MAX_DECODE_WIDTH / video.videoWidth)
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return jsQR(data, width, height, { inversionAttempts: 'dontInvert' })?.data ?? null
  }
}

/**
 * Streams the back camera into `videoRef` and calls `onResult` with each QR text found.
 * Stops the camera when the component unmounts.
 */
export function useQrScanner(videoRef: RefObject<HTMLVideoElement | null>, onResult: (text: string) => void) {
  const [status, setStatus] = useState<CameraStatus>('starting')
  const [attempt, setAttempt] = useState(0)
  const onResultRef = useRef(onResult)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable')
      return
    }

    let stopped = false
    let stream: MediaStream | null = null
    let timer: ReturnType<typeof setTimeout> | undefined
    let last = { text: '', at: 0 }

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
      } catch (error) {
        if (stopped) return
        setStatus((error as DOMException).name === 'NotAllowedError' ? 'denied' : 'unavailable')
        return
      }
      if (stopped) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      video.srcObject = stream
      await video.play().catch(() => undefined)
      const decode = await createDecoder()
      if (stopped) return
      setStatus('scanning')

      const tick = async () => {
        if (stopped) return
        const text = await decode(video).catch(() => null)
        const now = Date.now()
        if (text && !(text === last.text && now - last.at < REPEAT_WINDOW_MS)) {
          last = { text, at: now }
          onResultRef.current(text)
        }
        if (!stopped) timer = setTimeout(tick, SCAN_INTERVAL_MS)
      }
      void tick()
    }

    setStatus('starting')
    void start()
    return () => {
      stopped = true
      clearTimeout(timer)
      stream?.getTracks().forEach((t) => t.stop())
      video.srcObject = null
    }
  }, [videoRef, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { status, retry }
}
