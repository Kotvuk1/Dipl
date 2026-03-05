import React, { useState, useEffect } from 'react'
import { bearerToken } from '../firebase'
import Signal from '../components/Signal'
import TradeForm from '../components/TradeForm'

function Signals() {
  let [list, setList] = useState([])
  let [tradeTarget, setTradeTarget] = useState(null)

  async function grab() {
    try {
      let tkn = await bearerToken()
      let resp = await fetch('/api/signals?limit=50', { headers: { Authorization: `Bearer ${tkn}` } })
      let data = await resp.json()
      if (Array.isArray(data)) setList(data)
    } catch (e) {}
  }

  useEffect(() => { grab() }, [])

  return (
    <div style={{ color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#fff' }}>История сигналов</div>

      {list.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#555', fontSize: 14 }}>
          Сигналов пока нет. Перейди в раздел «Анализ» и запусти первый.
        </div>
      ) : (
        list.map(s => <Signal key={s.id} data={s} onTrade={sig => setTradeTarget(sig)} />)
      )}

      {tradeTarget && <TradeForm signal={tradeTarget} onClose={() => setTradeTarget(null)} onDone={() => grab()} />}
    </div>
  )
}

export default Signals
