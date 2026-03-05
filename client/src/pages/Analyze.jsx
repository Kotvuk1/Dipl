import React, { useState, useRef, useEffect } from 'react'
import { bearerToken } from '../firebase'
import Signal from '../components/Signal'
import TradeForm from '../components/TradeForm'
import { useToast } from '../components/Toast'

const ALL_PAIRS = [
  'BTCUSDT','ETHUSDT','SOLUSDT','XRPUSDT','BNBUSDT','DOGEUSDT','ADAUSDT','AVAXUSDT',
  'DOTUSDT','MATICUSDT','LINKUSDT','LTCUSDT','ATOMUSDT','NEARUSDT','APTUSDT',
  'ARBUSDT','OPUSDT','INJUSDT','SUIUSDT','TONUSDT'
]
let presets = ['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT','DOGEUSDT','ADAUSDT','AVAXUSDT']
let intervals = ['5m','15m','1h','4h','1d']

function Analyze() {
  let toast = useToast()
  let [sym, setSym] = useState('BTCUSDT')
  let [search, setSearch] = useState('BTCUSDT')
  let [showDrop, setShowDrop] = useState(false)
  let [tf, setTf] = useState('1h')
  let [result, setResult] = useState(null)
  let [spinning, setSpinning] = useState(false)
  let [tradeTarget, setTradeTarget] = useState(null)
  let searchRef = useRef(null)

  let filtered = ALL_PAIRS.filter(p => p.toLowerCase().includes(search.toLowerCase()))

  function pickSym(p) { setSym(p); setSearch(p); setShowDrop(false) }

  useEffect(() => {
    function out(e) { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', out)
    return () => document.removeEventListener('mousedown', out)
  }, [])

  async function launch() {
    setSpinning(true); setResult(null)
    try {
      let tkn = await bearerToken()
      let resp = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tkn}` },
        body: JSON.stringify({ symbol: sym, timeframe: tf }),
      })
      let data = await resp.json()
      if (data.err) throw new Error(data.err)
      setResult(data)
      toast(`Анализ ${sym} завершён — ${data.signal.action}`, 'ok')
    } catch (e) { toast(e.message, 'err') }
    setSpinning(false)
  }

  let inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#e0e0e0', fontFamily: 'Inter, sans-serif', fontSize: 14,
    outline: 'none',
  }

  let btnBase = { padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 13 }

  return (
    <div style={{ color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#fff' }}>ИИ-анализ рынка</div>

      <div style={{ position: 'relative', marginBottom: 12 }} ref={searchRef}>
        <input
          style={inputStyle}
          placeholder="Поиск актива — BTC, ETH, SOL..."
          value={search}
          onChange={e => { setSearch(e.target.value); setShowDrop(true); setSym('') }}
          onFocus={() => setShowDrop(true)}
        />
        {showDrop && filtered.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
            background: '#1a1a24', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 8, maxHeight: 200, overflowY: 'auto', marginTop: 4,
          }}>
            {filtered.map(p => (
              <div key={p} onClick={() => pickSym(p)} style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: 13,
                fontFamily: 'JetBrains Mono', color: '#e0e0e0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >{p}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {presets.map(p => (
          <button key={p} onClick={() => pickSym(p)} style={{
            ...btnBase,
            background: sym === p ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
            color: sym === p ? '#7c3aed' : '#888',
          }}>{p.replace('USDT','')}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {intervals.map(t => (
          <button key={t} onClick={() => setTf(t)} style={{
            ...btnBase,
            background: tf === t ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.03)',
            color: tf === t ? '#06b6d4' : '#888',
          }}>{t}</button>
        ))}
      </div>

      <button onClick={launch} disabled={spinning || !sym} style={{
        padding: '14px 32px', borderRadius: 10, border: 'none',
        background: spinning || !sym ? '#333' : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
        color: '#fff', fontSize: 15, fontWeight: 600, cursor: spinning || !sym ? 'default' : 'pointer',
        fontFamily: 'Inter, sans-serif', marginBottom: 28,
        boxShadow: spinning || !sym ? 'none' : '0 4px 20px rgba(124,58,237,0.3)',
      }}>
        {spinning ? 'Анализирую рынок...' : `Запустить анализ ${sym || '...'}`}
      </button>

      {result && result.signal && (
        <div>
          <Signal data={result.signal} onTrade={s => setTradeTarget(s)} />
          {result.indicators && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20, marginTop: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#bbb', marginBottom: 12 }}>Технические индикаторы</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {[
                  { lbl: 'RSI(14)', val: result.indicators.rsi },
                  { lbl: 'MACD', val: result.indicators.macd?.histogram },
                  { lbl: 'EMA 20', val: result.indicators.ema20 },
                  { lbl: 'EMA 50', val: result.indicators.ema50 },
                  { lbl: 'EMA 200', val: result.indicators.ema200 },
                  { lbl: 'BB верх', val: result.indicators.bb?.upper },
                  { lbl: 'BB низ', val: result.indicators.bb?.lower },
                  { lbl: 'Цена', val: result.price },
                ].map((ind, i) => (
                  <div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: 11, color: '#666' }}>{ind.lbl}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: '#ccc' }}>
                      {typeof ind.val === 'number' ? ind.val.toLocaleString() : ind.val || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tradeTarget && <TradeForm signal={tradeTarget} onClose={() => setTradeTarget(null)} />}
    </div>
  )
}

export default Analyze
