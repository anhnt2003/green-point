import { AttributionControl, LngLatBounds, Map as MapLibreMap, Marker, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import type { CollectionPoint } from '@/app/domain/types'
import type { LatLng } from '@/app/domain/geo'
import { FALLBACK_STYLE, PRIMARY_STYLE_URL } from './mapStyle'
import { createPinElement, createUserDotElement } from './markers'
import 'maplibre-gl/dist/maplibre-gl.css'
import './map.css'
import styles from './CollectionMap.module.css'

// The default worker URL is resolved next to the library file, which breaks under
// Vite's dependency pre-bundling. The worker is self-contained, so ?url is enough.
setWorkerUrl(workerUrl)

/** Camera commands. The map never moves on its own when data changes. */
export interface CollectionMapHandle {
  focusPoint(point: LatLng): void
  focusUser(): void
  fitTo(points: readonly LatLng[]): void
}

interface CollectionMapProps {
  points: readonly CollectionPoint[]
  /** Read once, when the map is created. */
  initialView: readonly LatLng[]
  selectedId: string | null
  onSelect(id: string): void
  userLocation: LatLng
  /** false = fallback position: the dot is drawn grey without the pulse. */
  userLocationLive: boolean
  ref?: Ref<CollectionMapHandle>
}

/** Room for pin height at the top and for the floating card that overlaps the map bottom. */
const FIT_PADDING = { top: 64, bottom: 72, left: 40, right: 40 }
const FIT_MAX_ZOOM = 15.5

function boundsOf(points: readonly LatLng[]) {
  const bounds = new LngLatBounds([points[0].lng, points[0].lat], [points[0].lng, points[0].lat])
  points.forEach((p) => bounds.extend([p.lng, p.lat]))
  return bounds
}

type Status = 'loading' | 'ready' | 'failed'

export function CollectionMap({
  points,
  initialView,
  selectedId,
  onSelect,
  userLocation,
  userLocationLive,
  ref,
}: CollectionMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const userMarkerRef = useRef<Marker | null>(null)
  const markersRef = useRef(new Map<string, { marker: Marker; button: HTMLButtonElement }>())
  const onSelectRef = useRef(onSelect)
  const userLocationRef = useRef(userLocation)
  const initialViewRef = useRef(initialView)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    onSelectRef.current = onSelect
    userLocationRef.current = userLocation
  }, [onSelect, userLocation])

  useImperativeHandle(
    ref,
    () => ({
      focusPoint(point) {
        mapRef.current?.easeTo({ center: [point.lng, point.lat], duration: 600 })
      },
      focusUser() {
        const map = mapRef.current
        const { lat, lng } = userLocationRef.current
        map?.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 15), duration: 800 })
      },
      fitTo(targets) {
        if (targets.length === 0) return
        mapRef.current?.fitBounds(boundsOf(targets), { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM, duration: 900 })
      },
    }),
    [],
  )

  // Create the map once; the effects below apply later prop changes.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const markers = markersRef.current

    let map: MapLibreMap
    try {
      map = new MapLibreMap({
        container,
        style: PRIMARY_STYLE_URL,
        bounds: boundsOf(initialViewRef.current),
        fitBoundsOptions: { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM },
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        maxPitch: 0,
      })
    } catch (error) {
      console.error('MapLibre could not start (WebGL unavailable?)', error)
      setStatus('failed')
      return
    }

    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    map.addControl(new AttributionControl({ compact: true }), 'top-right')

    let styleLoaded = false
    let usedFallback = false
    map.on('style.load', () => {
      styleLoaded = true
    })
    map.once('load', () => {
      setStatus('ready')
      // MapLibre opens the compact attribution at start; keep it as the (i) button so it
      // does not cover the map. It stays one tap away, as OpenFreeMap/OSM require.
      container.querySelector('.maplibregl-compact-show')?.classList.remove('maplibregl-compact-show')
    })
    map.on('error', (event) => {
      if (styleLoaded || usedFallback) return
      console.warn('Map style failed to load, falling back to OSM raster tiles', event.error)
      usedFallback = true
      map.setStyle(FALLBACK_STYLE)
    })

    const { lat, lng } = userLocationRef.current
    userMarkerRef.current = new Marker({ element: createUserDotElement() }).setLngLat([lng, lat]).addTo(map)

    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(container)
    mapRef.current = map

    return () => {
      resizeObserver.disconnect()
      markers.clear()
      map.remove()
      mapRef.current = null
      userMarkerRef.current = null
    }
  }, [])

  // Follow the device position.
  useEffect(() => {
    userMarkerRef.current?.setLngLat([userLocation.lng, userLocation.lat])
  }, [userLocation.lat, userLocation.lng])

  useEffect(() => {
    userMarkerRef.current?.getElement().classList.toggle('is-approx', !userLocationLive)
  }, [userLocationLive])

  // Sync markers with the filtered point list without recreating the map.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const markers = markersRef.current
    const visible = new Set(points.map((p) => p.id))

    for (const [id, entry] of markers) {
      if (!visible.has(id)) {
        entry.marker.remove()
        markers.delete(id)
      }
    }
    for (const point of points) {
      if (markers.has(point.id)) continue
      const { root, button } = createPinElement(point.name)
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        onSelectRef.current(point.id)
      })
      const marker = new Marker({ element: root, anchor: 'bottom' }).setLngLat([point.lng, point.lat]).addTo(map)
      markers.set(point.id, { marker, button })
    }
  }, [points])

  // Highlight the selected pin.
  useEffect(() => {
    for (const [id, { button }] of markersRef.current) button.classList.toggle('is-active', id === selectedId)
  }, [selectedId, points])

  return (
    <div className={styles.wrap}>
      <div ref={containerRef} className={styles.map} />
      {status === 'loading' && <div className={styles.overlay}>Đang tải bản đồ…</div>}
      {status === 'failed' && (
        <div className={`${styles.overlay} ${styles.failed}`}>
          Không hiển thị được bản đồ. Trình duyệt cần bật WebGL.
        </div>
      )}
    </div>
  )
}
