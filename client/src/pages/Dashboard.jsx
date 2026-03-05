import React, { useState, useEffect } from 'react'
import { bearerToken } from '../firebase'

function Dashboard() {
  let [stats, setStats] = useState(null)
  let [pairs, setPairs] = useState([])
  let [signals, setSignals] = useState([])

  useEffect(() => {
    let alive = true

    async function pull() {
      try {
        let tkn = await bearerToken()
        let hdrs = { Authorization: `Bearer ${tkn}` }
        let [sr, pr, sg] = await Promise.all([
          fetch('/api/analytics', { headers: hdrs }).then(r => r.json()),
          fetch('/api/market/pairs').then(r => r.json()),
          fetch('/api/signals?limit=5', { headers: hdrs }).then(r => r.json()),
        ])
        if (alive) {
          setStats(sr)
          setPairs(Array.isArray(pr) ? pr.slice(0, 8) : [])
          setSignals(Array.isArray(sg) ? sg : [])
        }
      } catch (e) {}
    }

    pull()
    let iv = setInterval(pull, 30000)
    return () => { alive = false; clearInterval(iv) }
  }, [])

  let cardBox = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: 20,
  }

  let metricStyle = (val) => ({
    fontFamily: 'JetBrains Mono', fontSize: 28, fontWeight: 700,
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  })

  return (
    <div style={{ color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#fff' }}>
        Панель управления
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Сигналов', val: stats?.signals || 0 },
          { label: 'Сделок', val: stats?.trades || 0 },
          { label: 'Винрейт', val: `${stats?.winRate || 0}%` },
          { label: 'Ср. уверенность', val: `${stats?.avgConfidence || 0}%` },
        ].map((m, i) => (
          <div key={i} style={cardBox}>
            <div style={metricStyle()}>{m.val}</div>
            <div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={cardBox}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#bbb', marginBottom: 14 }}>Топ пары по объёму</div>
          {pairs.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: '#ccc' }}>{p.symbol}</span>
              <span style={{ fontSize: 13, color: p.change >= 0 ? '#22c55e' : '#ef4444' }}>
                {p.change >= 0 ? '+' : ''}{p.change?.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        <div style={cardBox}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#bbb', marginBottom: 14 }}>Последние сигналы</div>
          {signals.length === 0 && <div style={{ fontSize: 13, color: '#555' }}>Пока нет сигналов. Запусти анализ.</div>}
          {signals.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: '#ccc' }}>{s.symbol}</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                  background: s.action === 'LONG' ? 'rgba(34,197,94,0.15)' : s.action === 'SHORT' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                  color: s.action === 'LONG' ? '#22c55e' : s.action === 'SHORT' ? '#ef4444' : '#eab308',
                }}>{s.action}</span>
              </div>
              <span style={{ fontSize: 12, color: '#666' }}>{s.confidence}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
