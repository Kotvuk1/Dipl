import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSession } from '../store/session'
import { leave } from '../firebase'

let icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  analyze: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      <path d="M11 8v6M8 11h6"/>
    </svg>
  ),
  chart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  trades: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/>
      <path d="M12 8v8M8 12l4-4 4 4"/>
    </svg>
  ),
  signals: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h4l3-9 4 18 3-9h4"/>
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  news: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
    </svg>
  ),
  alerts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  learn: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  config: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

let links = [
  { path: '/app', label: 'Панель', ico: icons.dashboard },
  { path: '/app/analyze', label: 'Анализ', ico: icons.analyze },
  { path: '/app/chart', label: 'Графики', ico: icons.chart },
  { path: '/app/trades', label: 'Сделки', ico: icons.trades },
  { path: '/app/signals', label: 'Сигналы', ico: icons.signals },
  { path: '/app/analytics', label: 'Статистика', ico: icons.analytics },
  { path: '/app/news', label: 'Новости', ico: icons.news },
  { path: '/app/alerts', label: 'Оповещения', ico: icons.alerts },
  { path: '/app/learn', label: 'Обучение', ico: icons.learn },
  { path: '/app/config', label: 'Настройки', ico: icons.config },
]

function Sidebar({ collapsed, toggle }) {
  let nav = useNavigate()
  let loc = useLocation()
  let { flame } = useSession()

  let base = {
    width: collapsed ? 64 : 220,
    minHeight: '100vh',
    background: 'rgba(10,10,15,0.95)',
    borderRight: '1px solid rgba(124,58,237,0.15)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s',
    padding: '12px 0',
    overflow: 'hidden',
  }

  let logoStyle = {
    padding: '8px 16px 20px',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: collapsed ? 16 : 20,
    fontWeight: 700,
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    cursor: 'pointer',
    textAlign: collapsed ? 'center' : 'left',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={base}>
      <div style={logoStyle} onClick={toggle}>
        {collapsed ? 'K' : 'KotvukAI'}
      </div>
      <div style={{ flex: 1 }}>
        {links.map(lk => {
          let active = loc.pathname === lk.path
          return (
            <div
              key={lk.path}
              onClick={() => nav(lk.path)}
              style={{
                padding: collapsed ? '10px 0' : '10px 16px',
                margin: '2px 8px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: active ? '#7c3aed' : '#a0a0b0',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                justifyContent: collapsed ? 'center' : 'flex-start',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              {lk.ico}
              {!collapsed && lk.label}
            </div>
          )
        })}
      </div>
      {flame && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {!collapsed && (
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {flame.email}
            </div>
          )}
          <div
            onClick={() => leave()}
            style={{
              padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
              fontSize: 13, textAlign: 'center', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {icons.logout}
            {!collapsed && 'Выйти'}
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
