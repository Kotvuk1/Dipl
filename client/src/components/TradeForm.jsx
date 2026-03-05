import React, { useState, useRef, useEffect } from 'react'
import { bearerToken } from '../firebase'
import { useToast } from './Toast'

const PAIRS = [
  'BTCUSDT','ETHUSDT','SOLUSDT','XRPUSDT','BNBUSDT','DOGEUSDT','ADAUSDT','AVAXUSDT',
  'DOTUSDT','MATICUSDT','LINKUSDT','LTCUSDT','ATOMUSDT','NEARUSDT','APTUSDT',
  'ARBUSDT','OPUSDT','INJUSDT','SUIUSDT','TONUSDT'
]

function TradeForm({ signal, onClose, onDone }) {
  let toast = useToast()
  let [vol, setVol] = useState('')
  let [tp, setTp] = useState('')
  let [sl, setSl] = useState('')
  let [lev, setLev] = useState(1)
  let [orderType, setOrderType] = useState('MARKET')
  let [entryPrice, setEntryPrice] = useState('')
  let [manualSym, setManualSym] = useState(signal ? signal.symbol : '')
  let [search, setSearch] = useState(signal ? signal.symbol : '')
  let [showDrop, setShowDrop] = useState(false)
  let [sending, setSending] = useState(false)
  let searchRef = useRef(null)

  let sym = manualSym || (signal ? signal.symbol : '')
  let direction = signal ? signal.action : 'LONG'

  let filtered = PAIRS.filter(p => p.toLowerCase().includes(search.toLowerCase()))

  function pickSym(p) {
    setManualSym(p)
    setSearch(p)
    setShowDrop(false)
  }

  useEffect(() => {
    function out(e) { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', out)
    return () => document.removeEventListener('mousedown', out)
  }, [])

  async function fire() {
    if (!sym) { toast('Выбери актив', 'err'); return }
    if (!vol) { toast('Укажи объём', 'err'); return }
    setSending(true)
    try {
      let tkn = await bearerToken()
      let resp = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tkn}` },
        body: JSON.stringify({
          signal_id: signal ? signal.id : null,
          symbol: sym,
          type: direction,
          entry_price: orderType === 'LIMIT' && entryPrice ? +entryPrice : null,
          amount: +vol,
          leverage: +lev,
          take_profit: tp ? +tp : null,
          stop_loss: sl ? +sl : null,
          order_type: orderType,
          source: signal ? 'SIGNAL' : 'MANUAL',
        }),
      })
      let data = await resp.json()
      if (data.err) throw new Error(data.err)
      toast('Сделка записана', 'ok')
      if (onDone) onDone(data)
      if (onClose) onClose()
    } catch (e) {
      toast(e.message, 'err')
    }
    setSending(false)
  }

  let overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
  }

  let card = {
    background: '#111118', borderRadius: 16, padding: 28, width: 420,
    border: '1px solid rgba(124,58,237,0.2)',
  }

  let inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#e0e0e0', fontFamily: 'Inter, sans-serif', fontSize: 14,
    outline: 'none', marginBottom: 12,
  }

  let pillBase = {
    flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s',
  }

  let pillActive = { ...pillBase, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: '#fff' }
  let pillInactive = { ...pillBase, background: 'rgba(255,255,255,0.04)', color: '#888' }

  let sliderStyle = {
    width: '100%', accentColor: '#7c3aed', cursor: 'pointer',
    height: 4, marginTop: 8, marginBottom: 4,
  }

  let labelStyle = { fontSize: 12, color: '#888', marginBottom: 6, display: 'block' }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={e => e.stopPropagation()}>

        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20, fontFamily: 'JetBrains Mono' }}>
          Новая сделка
        </div>

        <label style={labelStyle}>Актив</label>
        <div style={{ position: 'relative', marginBottom: 12 }} ref={searchRef}>
          <input
            style={{ ...inputStyle, marginBottom: 0 }}
            placeholder="Поиск актива — BTC, ETH, SOL..."
            value={search}
            onChange={e => { setSearch(e.target.value); setShowDrop(true); setManualSym('') }}
            onFocus={() => setShowDrop(true)}
          />
          {showDrop && filtered.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
              background: '#1a1a24', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 8, maxHeight: 200, overflowY: 'auto', marginTop: 4,
            }}>
              {filtered.map(p => (
                <div
                  key={p}
                  onClick={() => pickSym(p)}
                  style={{
                    padding: '9px 14px', cursor: 'pointer', fontSize: 13,
                    fontFamily: 'JetBrains Mono', color: '#e0e0e0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        <label style={labelStyle}>Тип ордера</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button style={orderType === 'MARKET' ? pillActive : pillInactive} onClick={() => setOrderType('MARKET')}>Рыночный</button>
          <button style={orderType === 'LIMIT' ? pillActive : pillInactive} onClick={() => setOrderType('LIMIT')}>Лимитный</button>
        </div>

        {orderType === 'LIMIT' && (
          <input style={inputStyle} placeholder="Цена входа" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} type="number" />
        )}

        <input style={inputStyle} placeholder="Объём (USDT)" value={vol} onChange={e => setVol(e.target.value)} type="number" />
        <input style={inputStyle} placeholder="Take Profit" value={tp} onChange={e => setTp(e.target.value)} type="number" />
        <input style={inputStyle} placeholder="Stop Loss" value={sl} onChange={e => setSl(e.target.value)} type="number" />

        <label style={{ ...labelStyle, marginBottom: 4 }}>
          Плечо: <span style={{ color: '#7c3aed', fontWeight: 700, fontSize: 14 }}>{lev}x</span>
        </label>
        <input type="range" min={1} max={100} value={lev} onChange={e => setLev(+e.target.value)} style={sliderStyle} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', marginBottom: 16 }}>
          <span>1x</span><span>25x</span><span>50x</span><span>75x</span><span>100x</span>
        </div>

        <button
          onClick={fire}
          disabled={sending}
          style={{
            width: '100%', padding: '12px', borderRadius: 8, border: 'none',
            background: direction === 'LONG' ? '#22c55e' : direction === 'SHORT' ? '#ef4444' : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', opacity: sending ? 0.6 : 1,
          }}
        >
          {sending ? 'Записываю...' : 'Зафиксировать сделку'}
        </button>
      </div>
    </div>
  )
}

export default TradeForm
