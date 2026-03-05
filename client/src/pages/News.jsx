import React, { useState, useEffect } from 'react'

let coins = ['', 'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA']

function News() {
  let [items, setItems] = useState([])
  let [filter, setFilter] = useState('')
  let [loading, setLoading] = useState(true)

  async function grab(coin) {
    setLoading(true)
    try {
      let url = '/api/news' + (coin ? `?coin=${coin}` : '')
      let resp = await fetch(url)
      let data = await resp.json()
      if (Array.isArray(data)) setItems(data)
    } catch (e) {}
    setLoading(false)
  }

  useEffect(() => { grab(filter) }, [filter])

  return (
    <div style={{ color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#fff' }}>Крипто-новости</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {coins.map(c => (
          <button key={c || '_all'} onClick={() => setFilter(c)} style={{
            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: filter === c ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
            color: filter === c ? '#7c3aed' : '#888',
            fontFamily: 'JetBrains Mono', fontSize: 13,
          }}>
            {c || 'Все'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#555', padding: 20 }}>Загружаю ленту...</div>
      ) : items.length === 0 ? (
        <div style={{ color: '#555', padding: 20 }}>Новостей по этому фильтру нет</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((n, i) => (
            <a
              key={i}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', padding: '16px 20px', borderRadius: 10,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none', transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              <div style={{ fontSize: 14, color: '#ddd', lineHeight: 1.5, marginBottom: 6 }}>{n.title}</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#666' }}>{n.source}</span>
                {n.currencies && n.currencies.map(c => (
                  <span key={c} style={{
                    padding: '2px 6px', borderRadius: 4, fontSize: 11,
                    background: 'rgba(6,182,212,0.1)', color: '#06b6d4',
                  }}>{c}</span>
                ))}
                <span style={{ fontSize: 11, color: '#555', marginLeft: 'auto' }}>
                  {n.published ? new Date(n.published).toLocaleString('ru-RU') : ''}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default News
