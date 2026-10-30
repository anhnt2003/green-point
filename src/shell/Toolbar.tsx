import { ArrowLeft, ExternalLink, LogOut, Maximize, Minimize, RotateCcw, Smartphone, Store, User } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Platform, Role } from '@/shared/bridge'
import { appUrl } from './device'
import type { ZoomMode } from './useShellSettings'
import styles from './shell.module.css'

interface ToolbarProps {
  platform: Platform
  zoom: ZoomMode
  role: Role | null
  onPlatform(platform: Platform): void
  onZoom(zoom: ZoomMode): void
  onLoginAs(role: Role): void
  onLogout(): void
  onReset(): void
  onBack(): void
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string; icon?: ReactNode }[]
  onChange(v: T): void
  label: string
}) {
  return (
    <div className={styles.segmented} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={`${styles.segment} ${o.value === value ? styles.segmentActive : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toolbar(props: ToolbarProps) {
  const { platform, zoom, role } = props
  return (
    <header className={styles.toolbar}>
      <div className={styles.toolbarBrand}>
        <Smartphone size={20} />
        <span>
          GreenPoint <em>Simulator</em>
        </span>
      </div>

      <Segmented
        label="Nền tảng"
        value={platform}
        onChange={props.onPlatform}
        options={[
          { value: 'ios', label: 'iOS' },
          { value: 'android', label: 'Android' },
        ]}
      />

      <div className={styles.toolGroup} aria-label="Tài khoản">
        <span className={styles.toolLabel}>Đăng nhập nhanh</span>
        <button
          type="button"
          className={`${styles.toolButton} ${role === 'citizen' ? styles.toolButtonActive : ''}`}
          onClick={() => props.onLoginAs('citizen')}
        >
          <User size={16} /> Người dân
        </button>
        <button
          type="button"
          className={`${styles.toolButton} ${role === 'business' ? styles.toolButtonActive : ''}`}
          onClick={() => props.onLoginAs('business')}
        >
          <Store size={16} /> Điểm thu gom
        </button>
        <button type="button" className={styles.toolButton} onClick={props.onLogout} disabled={!role}>
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>

      <div className={styles.toolGroup}>
        {platform === 'android' && (
          <button type="button" className={styles.toolButton} onClick={props.onBack} title="Nút Back của Android">
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <button type="button" className={styles.toolButton} onClick={props.onReset} title="Xoá dữ liệu đã lưu, về dữ liệu mẫu">
          <RotateCcw size={16} /> Reset dữ liệu
        </button>
        <Segmented
          label="Thu phóng"
          value={zoom}
          onChange={props.onZoom}
          options={[
            { value: 'fit', label: 'Vừa màn hình', icon: <Minimize size={14} /> },
            { value: 'actual', label: '100%', icon: <Maximize size={14} /> },
          ]}
        />
        <a className={styles.toolButton} href={appUrl(platform)} target="_blank" rel="noreferrer">
          <ExternalLink size={16} /> Mở riêng
        </a>
      </div>
    </header>
  )
}
