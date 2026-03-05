import React, { useState, useEffect } from 'react'
import { bearerToken } from '../firebase'

function Alerts() {
  let [items, setItems] = useState([])

  async function grab() {
    try {
      let tkn = await bearerToken()
      let resp = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${tkn}` } })
      let data = await resp.json()
      if (Array.isArray(data)) setItems(data)
    } catch (e) {}
  }

  useEffect(() => { grab() }, [])

  async function markRead(nid) {
    let tkn = await bearerToken()
    await fetch(`/api/notifications/${nid}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tkn}` },
    })
    grab()
  }

  async function markAll() {
    let tkn = await bearerToken()
    await fetch('/api/notifications/mark-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tkn}` },
    })
    grab()
  }

  let unread = items.filter(n => !n.is_read).length

  return (
    <div style={{ color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
          Оповещения {unread > 0 && <span style={{ fontSize: 14, color: '#7c3aed' }}>({unread} непрочитанных)</span>}
        </div>
        {unread > 0 && (
          <button onClick={markAll} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: 'rgba(124,58,237,0.15)', color: '#7c3aed',
            fontSize: 13, cursor: 'pointer',
          }}>
            Прочитать все
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#555', fontSize: 14 }}>
          Нет оповещений. Они появятся при сильных сигналах (уверенность 80%+).
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              style={{
                padding: '14px 18px', borderRadius: 10, cursor: n.is_read ? 'default' : 'pointer',
                background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(124,58,237,0.06)',
                border: `1px solid ${n.is_read ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.15)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: n.is_read ? '#888' : '#ddd' }}>{n.message}</div>
                {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />}
              </div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>
                {new Date(n.created_at).toLocaleString('ru-RU')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Alerts
