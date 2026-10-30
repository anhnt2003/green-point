import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { isAppMessage, postToApp, type Platform, type Role } from '@/shared/bridge'
import { DEVICES, appUrl, frameSize } from './device'
import { DeviceFrame } from './DeviceFrame'
import { Toolbar } from './Toolbar'
import { useShellSettings } from './useShellSettings'
import styles from './shell.module.css'

const CAPTION_HEIGHT = 40
const STAGE_PADDING = 24

const ROLE_LABEL: Record<Role, string> = { citizen: 'Người dân', business: 'Điểm thu gom' }

export function Simulator() {
  const [settings, setSettings] = useShellSettings()
  const { platform, zoom } = settings
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const stageRef = useRef<HTMLElement>(null)
  // The iframe src is fixed at mount; later platform switches go through postMessage (no reload).
  const [src] = useState(() => appUrl(platform))
  const [route, setRoute] = useState<{ path: string; role: Role | null }>({ path: '/', role: null })
  const [fitScale, setFitScale] = useState(1)

  const send = useCallback((msg: Parameters<typeof postToApp>[1]) => postToApp(iframeRef.current?.contentWindow, msg), [])

  useEffect(() => {
    send({ type: 'platform', platform })
  }, [platform, send])

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !isAppMessage(e.data)) return
      if (e.data.type === 'ready') send({ type: 'platform', platform })
      if (e.data.type === 'route') setRoute({ path: e.data.path, role: e.data.role })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [platform, send])

  // Scale the whole phone to fit the window. The app lives in an iframe, so pointer
  // coordinates inside it (MapLibre) stay correct under the CSS transform.
  const frame = frameSize(platform)
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      const availW = stage.clientWidth - STAGE_PADDING * 2
      const availH = stage.clientHeight - STAGE_PADDING * 2 - CAPTION_HEIGHT
      setFitScale(Math.max(0.35, Math.min(1, availW / frame.width, availH / frame.height)))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [frame.width, frame.height])

  const scale = zoom === 'fit' ? fitScale : 1
  const setPlatform = (p: Platform) => setSettings((s) => ({ ...s, platform: p }))

  return (
    <div className={styles.shell}>
      <Toolbar
        platform={platform}
        zoom={zoom}
        role={route.role}
        onPlatform={setPlatform}
        onZoom={(z) => setSettings((s) => ({ ...s, zoom: z }))}
        onLoginAs={(role) => send({ type: 'loginAs', role })}
        onLogout={() => send({ type: 'logout' })}
        onReset={() => {
          if (window.confirm('Xoá toàn bộ dữ liệu đã lưu và quay về dữ liệu mẫu?')) send({ type: 'reset' })
        }}
        onBack={() => send({ type: 'back' })}
      />

      <main ref={stageRef} className={`${styles.stage} ${zoom === 'actual' ? styles.stageScroll : ''}`}>
        <div className={styles.deviceSlot} style={{ width: frame.width * scale, height: frame.height * scale }}>
          <div className={styles.deviceScaler} style={{ transform: `scale(${scale})` }}>
            <DeviceFrame platform={platform}>
              <iframe ref={iframeRef} src={src} title="GreenPoint app" className={styles.iframe} allow="geolocation" />
            </DeviceFrame>
          </div>
        </div>
        <p className={styles.caption}>
          {DEVICES[platform].name} · 390×844 · {Math.round(scale * 100)}%
          <span className={styles.captionSep}>|</span>
          <code>{route.path}</code>
          <span className={styles.captionSep}>|</span>
          {route.role ? ROLE_LABEL[route.role] : 'Chưa đăng nhập'}
        </p>
      </main>
    </div>
  )
}
