import React from 'react'

function Signal({ data, onTrade }) {
  if (!data) return null

  let clr = data.action === 'LONG' ? '#22c55e' : data.action === 'SHORT' ? '#ef4444' : '#eab308'
  let glow = data.action === 'LONG' ? '0 0 20px rgba(34,197,94,0.3)' : data.action === 'SHORT' ? '0 0 20px rgba(239,68,68,0.3)' : 'none'

  let reasons = data.reason || {}

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 16, color: '#fff', fontWeight: 600 }}>
            {data.symbol}
          </span>
          <span style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600,
            background: `${clr}22`, color: clr, boxShadow: glow,
          }}>
            {data.action}
          </span>
          <span style={{ fontSize: 13, color: '#888' }}>{data.timeframe}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: `conic-gradient(${clr} ${data.confidence * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: '#0a0a0f',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: clr, fontWeight: 700,
            }}>
              {data.confidence}
            </div>
          </div>
        </div>
      </div>
      {reasons.indicators && (
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 6, lineHeight: 1.5 }}>
          <span style={{ color: '#7c3aed', marginRight: 6 }}>Индикаторы:</span>{reasons.indicators}
        </div>
      )}
      {reasons.priceAction && (
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 6, lineHeight: 1.5 }}>
          <span style={{ color: '#06b6d4', marginRight: 6 }}>Price Action:</span>{reasons.priceAction}
        </div>
      )}
      {reasons.risks && (
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 6, lineHeight: 1.5 }}>
          <span style={{ color: '#ef4444', marginRight: 6 }}>Риски:</span>{reasons.risks}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {data.btc_corr !== null && data.btc_corr !== undefined && (
          <span style={{ fontSize: 12, color: '#666', padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }}>
            BTC корр: {data.btc_corr}
          </span>
        )}
        <span style={{ fontSize: 12, color: '#555' }}>
          {new Date(data.created_at).toLocaleString('ru-RU')}
        </span>
      </div>
      {onTrade && (
        <button
          onClick={() => onTrade(data)}
          style={{
            marginTop: 12, padding: '8px 20px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Открыть сделку
        </button>
      )}
    </div>
  )
}

export default Signal
