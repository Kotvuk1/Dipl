import React, { useState, useRef, useEffect } from 'react'
import { bearerToken } from '../firebase'

function ChatBot() {
  let [open, setOpen] = useState(false)
  let [msgs, setMsgs] = useState([{ role: 'bot', text: 'Привет. Спроси что угодно про рынок или напиши пару для анализа.' }])
  let [draft, setDraft] = useState('')
  let [busy, setBusy] = useState(false)
  let endRef = useRef(null)

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  function extractPair(txt) {
    let up = txt.toUpperCase()
    let m = up.match(/[A-Z]{2,10}USDT/)
    if (m) return m[0]
    let coins = ['BTC','ETH','SOL','BNB','XRP','DOGE','ADA','AVAX','DOT','LINK','MATIC','NEAR','APT','ARB','OP','INJ','SUI','TON']
    for (let c of coins) { if (up.includes(c)) return c + 'USDT' }
    return null
  }

  async function shoot() {
    if (!draft.trim() || busy) return
    let userMsg = draft.trim()
    setDraft('')
    setMsgs(prev => [...prev, { role: 'user', text: userMsg }])
    setBusy(true)

    let pair = extractPair(userMsg)

    try {
      let tkn = await bearerToken()
      if (pair) {
        let resp = await fetch('/api/ai/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tkn}` },
          body: JSON.stringify({ symbol: pair, timeframe: '1h' }),
        })
        let data = await resp.json()
        if (data.err) throw new Error(data.err)
        let s = data.signal
        let reply = `${s.symbol} — ${s.action}\nУверенность: ${s.confidence}%\n\n${s.reason?.indicators || ''}\n${s.reason?.priceAction || ''}`
        setMsgs(prev => [...prev, { role: 'bot', text: reply.trim() }])
      } else {
        let resp = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tkn}` },
          body: JSON.stringify({ message: userMsg }),
        })
        let data = await resp.json()
        if (data.err) throw new Error(data.err)
        setMsgs(prev => [...prev, { role: 'bot', text: data.reply || 'Не понял вопрос. Напиши название пары, например: BTC или ETHUSDT' }])
      }
    } catch (e) {
      setMsgs(prev => [...prev, { role: 'bot', text: `Ошибка: ${e.message}` }])
    }
    setBusy(false)
  }

  let chatIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )

  let sendIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )

  if (!open) {
    return (
      <div onClick={() => setOpen(true)} style={{
        position: 'fixed', bottom: 24, right: 24, width: 52, height: 52,
        borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 998, boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
        color: '#fff',
      }}>
        {chatIcon}
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, width: 360, height: 480,
      background: '#111118', borderRadius: 16, border: '1px solid rgba(124,58,237,0.2)',
      display: 'flex', flexDirection: 'column', zIndex: 998,
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: '#7c3aed' }}>KotvukAI чат</span>
        <span onClick={() => setOpen(false)} style={{ cursor: 'pointer', color: '#666', fontSize: 18 }}>✕</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
            padding: '8px 14px', borderRadius: 10, fontSize: 13, color: '#ccc',
            maxWidth: '85%', lineHeight: 1.5, whiteSpace: 'pre-wrap',
          }}>{m.text}</div>
        ))}
        {busy && (
          <div style={{ alignSelf: 'flex-start', fontSize: 13, color: '#7c3aed', padding: '8px 14px' }}>
            Анализирую...
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && shoot()}
          placeholder="Пара или вопрос..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#e0e0e0', fontFamily: 'Inter, sans-serif', fontSize: 13, outline: 'none',
          }}
        />
        <button onClick={shoot} style={{
          padding: '10px 14px', borderRadius: 8, border: 'none',
          background: '#7c3aed', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{sendIcon}</button>
      </div>
    </div>
  )
}

export default ChatBot
