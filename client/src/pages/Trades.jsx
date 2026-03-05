import React, { useState, useEffect } from 'react'
import { bearerToken } from '../firebase'
import TradeForm from '../components/TradeForm'
import { useToast } from '../components/Toast'

function Trades() {
  let toast = useToast()
  let [rows, setRows] = useState([])
  let [showForm, setShowForm] = useState(false)

  async function pull() {
    try {
      let tkn = await bearerToken()
      let resp = await fetch('/api/trades', { headers: { Authorization: `Bearer ${tkn}` } })
      let data = await resp.json()
      if (Array.isArray(data)) setRows(data)
    } catch (e) {}
  }

  useEffect(() => { pull() }, [])

  async function closeTrade(tid) {
    try {
      let tkn = await bearerToken()
      await fetch(`/api/trades/${tid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tkn}` },
        body: JSON.stringify({ status: 'CLOSED', closed_at: new Date().toISOString() }),
      })
      toast('Сделка закрыта', 'ok')
      pull()
    } catch (e) {
      toast(e.message, 'err')
    }
  }

  async function removeTrade(tid) {
    try {
      let tkn = await bearerToken()
      await fetch(`/api/trades/${tid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tkn}` },
      })
      pull()
    } catch (e) {}
  }

  let th = { padding: '10px 14px', textAlign: 'left', fontSize: 12, color: '#777', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase', letterSpacing: '0.05em' }
  let td = { padding: '10px 14px', fontSize: 13, color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.04)' }

  return (
    <div style={{ color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Журнал сделок</div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          + Добавить
        </button>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#555', fontSize: 14 }}>
          Сделок пока нет. Запусти ИИ-анализ или добавь вручную.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Пара</th>
                <th style={th}>Тип</th>
                <th style={th}>Статус</th>
                <th style={th}>Объём</th>
                <th style={th}>Плечо</th>
                <th style={th}>PnL</th>
                <th style={th}>Дата</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(t => (
                <tr key={t.id}>
                  <td style={{ ...td, fontFamily: 'JetBrains Mono' }}>{t.symbol}</td>
                  <td style={td}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: t.type === 'LONG' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: t.type === 'LONG' ? '#22c55e' : '#ef4444',
                    }}>{t.type}</span>
                  </td>
                  <td style={td}>
                    <span style={{ color: t.status === 'ACTIVE' ? '#06b6d4' : '#666' }}>{t.status}</span>
                  </td>
                  <td style={{ ...td, fontFamily: 'JetBrains Mono' }}>{t.amount}</td>
                  <td style={td}>{t.leverage}x</td>
                  <td style={{ ...td, fontFamily: 'JetBrains Mono', color: +t.pnl > 0 ? '#22c55e' : +t.pnl < 0 ? '#ef4444' : '#888' }}>
                    {+t.pnl > 0 ? '+' : ''}{t.pnl}
                  </td>
                  <td style={{ ...td, fontSize: 12, color: '#666' }}>
                    {new Date(t.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {t.status === 'ACTIVE' && (
                        <button onClick={() => closeTrade(t.id)} style={{
                          padding: '4px 10px', borderRadius: 4, border: 'none',
                          background: 'rgba(234,179,8,0.15)', color: '#eab308',
                          fontSize: 11, cursor: 'pointer',
                        }}>Закрыть</button>
                      )}
                      <button onClick={() => removeTrade(t.id)} style={{
                        padding: '4px 10px', borderRadius: 4, border: 'none',
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                        fontSize: 11, cursor: 'pointer',
                      }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <TradeForm
          signal={null}
          onClose={() => setShowForm(false)}
          onDone={() => pull()}
        />
      )}
    </div>
  )
}

export default Trades
