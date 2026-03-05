import React, { useState, useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'
import { useMarket } from '../hooks/useMarket'

let timeframes = ['1m', '5m', '15m', '1h', '4h', '1d']

function ChartPage() {
  let [pair, setPair] = useState('BTCUSDT')
  let [tf, setTf] = useState('1h')
  let [topPairs, setTopPairs] = useState([])
  let container = useRef(null)
  let chartRef = useRef(null)
  let seriesRef = useRef(null)
  let volRef = useRef(null)

  let { candles, tick } = useMarket(pair, tf, 200)

  useEffect(() => {
    fetch('/api/market/pairs').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setTopPairs(d.slice(0, 20))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!container.current) return
    if (chartRef.current) chartRef.current.remove()

    let ch = createChart(container.current, {
      width: container.current.clientWidth,
      height: 500,
      layout: { background: { color: '#0a0a0f' }, textColor: '#888' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.03)' }, horzLines: { color: 'rgba(255,255,255,0.03)' } },
      crosshair: { mode: 0 },
      timeScale: { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
    })

    let cs = ch.addCandlestickSeries({
      upColor: '#22c55e', downColor: '#ef4444',
      borderUpColor: '#22c55e', borderDownColor: '#ef4444',
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    })

    let vs = ch.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    })
    vs.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } })

    chartRef.current = ch
    seriesRef.current = cs
    volRef.current = vs

    let resizer = () => ch.applyOptions({ width: container.current.clientWidth })
    window.addEventListener('resize', resizer)
    return () => { window.removeEventListener('resize', resizer); ch.remove(); chartRef.current = null }
  }, [])

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return
    seriesRef.current.setData(candles.map(c => ({
      time: c.time, open: c.open, high: c.high, low: c.low, close: c.close,
    })))
    volRef.current.setData(candles.map(c => ({
      time: c.time, value: c.volume, color: c.close >= c.open ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
    })))
  }, [candles])

  let inputStyle = {
    padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)', color: '#e0e0e0', fontFamily: 'JetBrains Mono',
    fontSize: 13, outline: 'none',
  }

  return (
    <div style={{ color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          value={pair}
          onChange={e => setPair(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {topPairs.map(p => (
            <option key={p.symbol} value={p.symbol} style={{ background: '#111' }}>{p.symbol}</option>
          ))}
          {topPairs.length === 0 && <option value="BTCUSDT">BTCUSDT</option>}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          {timeframes.map(t => (
            <button
              key={t}
              onClick={() => setTf(t)}
              style={{
                padding: '6px 12px', borderRadius: 6, border: 'none',
                background: tf === t ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                color: tf === t ? '#7c3aed' : '#888',
                cursor: 'pointer', fontSize: 13, fontFamily: 'JetBrains Mono',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        {tick && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: '#fff' }}>
              ${tick.price?.toLocaleString()}
            </span>
            <span style={{ fontSize: 14, color: tick.change >= 0 ? '#22c55e' : '#ef4444' }}>
              {tick.change >= 0 ? '+' : ''}{tick.change?.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
      <div ref={container} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }} />
    </div>
  )
}

export default ChartPage
