import React, { useState } from 'react'
import { useSession } from '../store/session'
import { bearerToken } from '../firebase'
import { useToast } from '../components/Toast'

function Config() {
  let { profile } = useSession()
  let toast = useToast()
  let [lang, setLang] = useState(profile?.language || 'ru')
  let [saving, setSaving] = useState(false)

  async function saveLang(l) {
    setLang(l)
    setSaving(true)
    try {
      let tkn = await bearerToken()
      let resp = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tkn}` },
        body: JSON.stringify({ language: l }),
      })
      let data = await resp.json()
      if (data.err) throw new Error(data.err)
      toast('Язык сохранён', 'ok')
    } catch (e) { toast(e.message, 'err') }
    setSaving(false)
  }

  return (
    <div style={{ color: '#e0e0e0', fontFamily: 'Inter, sans-serif', maxWidth: 600 }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#fff' }}>Настройки</div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#bbb', marginBottom: 16 }}>Профиль</div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>Email: <span style={{ color: '#ccc' }}>{profile?.email || '—'}</span></div>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
          Тариф: <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, background: profile?.plan === 'pro' ? 'rgba(124,58,237,0.15)' : 'rgba(6,182,212,0.1)', color: profile?.plan === 'pro' ? '#7c3aed' : '#06b6d4' }}>{profile?.plan || 'free'}</span>
        </div>
        <div style={{ fontSize: 14, color: '#888' }}>ID: <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#555' }}>{profile?.id || '—'}</span></div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#bbb', marginBottom: 16 }}>Язык интерфейса</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ code: 'ru', label: 'Русский' }, { code: 'en', label: 'English' }].map(l => (
            <button key={l.code} onClick={() => saveLang(l.code)} disabled={saving} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: lang === l.code ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
              color: lang === l.code ? '#7c3aed' : '#888', fontSize: 13,
              opacity: saving ? 0.6 : 1,
            }}>{l.label}</button>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#bbb', marginBottom: 12 }}>О платформе</div>
        <div style={{ fontSize: 13, color: '#777', lineHeight: 1.7 }}>KotvukAI — торговый ИИ-ассистент для криптовалютного рынка. Анализ на основе индикаторов RSI, MACD, EMA, Bollinger Bands, новостного фона и корреляции с Bitcoin. Данные с Binance в реальном времени.</div>
        <div style={{ fontSize: 12, color: '#555', marginTop: 12 }}>Версия 2.0 · Рыночные данные обновляются каждые 15 секунд</div>
      </div>
    </div>
  )
}

export default Config
