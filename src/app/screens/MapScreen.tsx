import { BookOpen, LoaderCircle, LocateFixed, MapPin, Recycle, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { FilterChips, type ChipOption } from '@/app/components/FilterChips'
import { CATEGORY_LABEL, COLLECTION_POINTS } from '@/app/data/seed'
import { formatDistanceKm, normalizeSearch } from '@/app/domain/format'
import { sortByDistance, type LatLng } from '@/app/domain/geo'
import type { WasteCategory } from '@/app/domain/types'
import { toast } from '@/app/feedback/useFeedback'
import { AppHeader, HeaderAction } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { CollectionMap, type CollectionMapHandle } from '@/app/map/CollectionMap'
import { useUserLocation, type LocationStatus } from '@/app/map/useUserLocation'
import styles from './MapScreen.module.css'

type Filter = 'all' | WasteCategory

const FILTERS: readonly ChipOption<Filter>[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'plastic', label: 'Chai nhựa' },
  { value: 'paper', label: 'Giấy' },
  { value: 'metal', label: 'Kim loại' },
]

/** How many nearest points the first real fix frames together with the user. */
const NEAREST_IN_VIEW = 3

const FALLBACK_NOTICE: Partial<Record<LocationStatus, string>> = {
  locating: 'Đang xác định vị trí…',
  denied: 'Vị trí mặc định · chưa cấp quyền',
  unavailable: 'Vị trí mặc định · không có tín hiệu',
  unsupported: 'Vị trí mặc định · không hỗ trợ định vị',
}

/** Screen 03 — Bản đồ điểm thu gom (GreenMap), sorted by the real device position. */
export function MapScreen() {
  const navigate = useNavigate()
  const { location, status, retry } = useUserLocation()
  const isLive = status === 'live'
  const mapRef = useRef<CollectionMapHandle>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [pickedId, setPickedId] = useState<string | null>(null)

  const byDistance = useMemo(() => sortByDistance(COLLECTION_POINTS, location), [location])

  // A known position at mount frames the user with the nearest points; otherwise show all points.
  const [initialView] = useState<LatLng[]>(() =>
    isLive ? [location, ...byDistance.slice(0, NEAREST_IN_VIEW)] : [location, ...COLLECTION_POINTS],
  )

  // When the first real fix arrives, bring the user and the nearest points into view once.
  const framedRef = useRef(isLive)
  useEffect(() => {
    if (!isLive || framedRef.current) return
    framedRef.current = true
    mapRef.current?.fitTo([location, ...byDistance.slice(0, NEAREST_IN_VIEW)])
  }, [isLive, location, byDistance])

  const visible = useMemo(() => {
    const q = normalizeSearch(query)
    return byDistance.filter(
      (p) =>
        (filter === 'all' || p.accepts.includes(filter)) &&
        (!q || normalizeSearch(`${p.name} ${p.address}`).includes(q)),
    )
  }, [byDistance, filter, query])

  // Until the user picks a point, the card follows the nearest visible one.
  const selected = visible.find((p) => p.id === pickedId) ?? visible[0] ?? null

  const pick = useCallback(
    (id: string) => {
      setPickedId(id)
      const point = COLLECTION_POINTS.find((p) => p.id === id)
      if (point) mapRef.current?.focusPoint(point)
    },
    [],
  )

  const locateMe = () => {
    if (isLive) {
      mapRef.current?.focusUser()
      return
    }
    if (status === 'denied') {
      toast('Hãy cho phép trang này truy cập vị trí trong cài đặt trình duyệt, rồi thử lại.', 'info')
    } else if (status === 'unsupported') {
      toast('Định vị cần trang chạy qua https hoặc localhost.', 'info')
    }
    retry()
  }

  const openDirections = () => {
    if (!selected) return
    // Without a real fix, let Google Maps use its own idea of where the user is.
    const origin = isLive ? `&origin=${location.lat},${location.lng}` : ''
    const url = `https://www.google.com/maps/dir/?api=1${origin}&destination=${selected.lat},${selected.lng}&travelmode=walking`
    window.open(url, '_blank', 'noopener')
  }

  const notice = FALLBACK_NOTICE[status]

  return (
    <Screen
      header={
        <AppHeader
          title="Điểm thu gom gần bạn"
          right={
            <HeaderAction label="Hướng dẫn phân loại" onClick={() => navigate('/guide')}>
              <BookOpen size={22} strokeWidth={2} />
            </HeaderAction>
          }
        />
      }
      scroll={false}
      bodyClassName={styles.body}
    >
      <form
        className={styles.search}
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          if (visible[0]) pick(visible[0].id)
        }}
      >
        <Search size={20} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Tìm điểm thu gom, khu vực..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tìm điểm thu gom"
          enterKeyHint="search"
        />
        {query && (
          <button type="button" className={styles.clear} onClick={() => setQuery('')} aria-label="Xoá tìm kiếm">
            <X size={16} />
          </button>
        )}
      </form>

      <FilterChips options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Lọc theo loại rác" />

      <div className={styles.mapArea}>
        <CollectionMap
          ref={mapRef}
          points={visible}
          initialView={initialView}
          selectedId={selected?.id ?? null}
          onSelect={pick}
          userLocation={location}
          userLocationLive={isLive}
        />
        {notice && (
          <div className={styles.notice} role="status">
            {status === 'locating' && <LoaderCircle size={14} className={styles.spin} />}
            {notice}
          </div>
        )}
        <button
          type="button"
          className={`${styles.locate} ${isLive ? styles.locateLive : ''} pressable`}
          onClick={locateMe}
          aria-label="Vị trí của tôi"
          title="Vị trí của tôi"
        >
          <LocateFixed size={22} strokeWidth={2.2} />
        </button>
      </div>

      <section className={styles.card} aria-live="polite">
        {selected ? (
          <>
            <div className={styles.cardHead}>
              <span className={styles.cardIcon}>
                <Recycle size={24} strokeWidth={2.2} />
              </span>
              <h2 className={styles.cardTitle}>{selected.name}</h2>
              <span className={styles.distance} title={isLive ? 'Tính từ vị trí hiện tại' : 'Tính từ vị trí mặc định'}>
                <MapPin size={14} />
                {formatDistanceKm(selected.distanceKm)}
              </span>
            </div>
            <div className={styles.cardLines}>
              <p>{selected.address}</p>
              <p>Nhận: {selected.accepts.map((c) => CATEGORY_LABEL[c]).join(', ')}</p>
              <p>Mở cửa: {selected.openHours}</p>
            </div>
            <Button onClick={openDirections}>Chỉ đường</Button>
          </>
        ) : (
          <p className={styles.noResult}>Không tìm thấy điểm thu gom phù hợp.</p>
        )}
      </section>
    </Screen>
  )
}
