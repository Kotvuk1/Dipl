import React, { useState, useEffect } from 'react'
import { bearerToken } from '../firebase'

function Analytics() {
  let [data, setData] = useState(null)
  let [btData, setBtData] = useState([])
  let [btSym, setBtSym] = useState('BTCUSDT')
  let [btPer, setBtPer] = useState('30d')
  let [btRunning, setBtRunning] = useState(false)

  useEffect(() => {
    async function grab() {
      try {
        let tkn = await bearerToken()
        let hdrs = { Authorization: `Bearer ${tkn}` }
        let [an, bt] = await Promise.all([
          fetch('/api/analytics', { headers: hdrs }).then(r => r.json()),
          fetch('/api/backtest/history', { headers: hdrs }).then(r => r.json()),
        ])
        setData(an)
        if (Array.isArray(bt)) setBtData(bt)
      } catch (e) {}
    }
    grab()
  }, [])

  async function runBacktest() {
    setBtRunning(true)
    try {
      let tkn = await bearerToken()
      let resp = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tkn}` },
        body: JSON.stringify({ symbol: btSym, period: btPer }),
      })
      let result = await resp.json()
      setBtData(prev => [result, ...prev])
    } catch (e) {}
    setBtRunning(false)
  }

  let box = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: 20,
  }

  let numStyle = {
    fontFamily: 'JetBrains Mono', fontSize: 28, fontWeight: 700,
    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  }

  return (
    <div style={{ color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#fff' }}>Аналитика и бэктест</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={box}><div style={numStyle}>{data?.signals || 0}</div><div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>Всего сигналов</div></div>
        <div style={box}><div style={numStyle}>{data?.trades || 0}</div><div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>Всего сделок</div></div>
        <div style={box}><div style={numStyle}>{data?.winRate || 0}%</div><div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>Винрейт</div></div>
        <div style={box}><div style={numStyle}>{data?.avgConfidence || 0}%</div><div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>Средняя уверенность</div></div>
      </div>

      <div style={box}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#bbb', marginBottom: 16 }}>Запустить бэктест</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <select value={btSym} onChange={e => setBtSym(e.target.value)} style={{
            padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)', color: '#ccc', fontSize: 13,
          }}>
            {['BTCUSDT','ETHUSDT','SOLUSDT','XRPUSDT','BNBUSDT','DOGEUSDT','ADAUSDT','AVAXUSDT','DOTUSDT','MATICUSDT','LINKUSDT','LTCUSDT','ATOMUSDT','NEARUSDT','APTUSDT','ARBUSDT','OPUSDT','INJUSDT','SUIUSDT','TONUSDT'].map(s => (
              <option key={s} value={s} style={{ background: '#111' }}>{s}</option>
            ))}
          </select>
          <select value={btPer} onChange={e => setBtPer(e.target.value)} style={{
            padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)', color: '#ccc', fontSize: 13,
          }}>
            <option value="7d" style={{ background: '#111' }}>7 дней</option>
            <option value="30d" style={{ background: '#111' }}>30 дней</option>
            <option value="90d" style={{ background: '#111' }}>90 дней</option>
          </select>
          <button onClick={runBacktest} disabled={btRunning} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: btRunning ? '#333' : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: btRunning ? 'default' : 'pointer',
          }}>
            {btRunning ? 'Считаю...' : 'Запустить'}
          </button>
        </div>

        {btData.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Пара', 'Период', 'Сигналов', 'Верных', 'Точность', 'Дата'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#666', borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {btData.map((b, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: '#ccc', fontFamily: 'JetBrains Mono', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{b.symbol}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: '#888', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{b.period}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{b.totalSignals || b.total_signals}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: '#22c55e', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{b.correct}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: +b.accuracy > 60 ? '#22c55e' : +b.accuracy > 45 ? '#eab308' : '#ef4444', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{b.accuracy}%</td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: '#555', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{b.created_at ? new Date(b.created_at).toLocaleDateString('ru-RU') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Analytics
