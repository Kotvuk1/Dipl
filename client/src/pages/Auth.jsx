import React, { useState } from 'react'
import { enterWithGoogle } from '../firebase'

function Auth() {
  let [err, setErr] = useState(null)

  async function go() {
    try {
      setErr(null)
      await enterWithGoogle()
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 20, padding: 48, textAlign: 'center', width: 380,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 32, fontWeight: 700,
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 12,
        }}>
          KotvukAI
        </div>
        <div style={{ color: '#777', fontSize: 14, marginBottom: 32, fontFamily: 'Inter' }}>
          Торговый ИИ-аналитик для крипторынка
        </div>
        <button
          onClick={go}
          style={{
            width: '100%', padding: '14px 24px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
          }}
        >
          Войти через Google
        </button>
        {err && (
          <div style={{ color: '#ef4444', fontSize: 13, marginTop: 16 }}>{err}</div>
        )}
        <div style={{ color: '#444', fontSize: 12, marginTop: 24 }}>
          Мы не храним пароли. Авторизация через Firebase.
        </div>
      </div>
    </div>
  )
}

export default Auth
