import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'

let ToastCtx = createContext(null)

function ToastZone({ children }) {
  let [stack, setStack] = useState([])

  let push = useCallback((msg, kind) => {
    let id = Date.now() + Math.random()
    setStack(prev => [...prev, { id, msg, kind: kind || 'info' }])
    setTimeout(() => {
      setStack(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8
      }}>
        {stack.map(t => (
          <div key={t.id} style={{
            padding: '12px 20px',
            borderRadius: 10,
            background: t.kind === 'err' ? 'rgba(239,68,68,0.15)' : t.kind === 'ok' ? 'rgba(34,197,94,0.15)' : 'rgba(124,58,237,0.15)',
            border: `1px solid ${t.kind === 'err' ? '#ef4444' : t.kind === 'ok' ? '#22c55e' : '#7c3aed'}`,
            color: '#e0e0e0',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            backdropFilter: 'blur(12px)',
            animation: 'slideIn 0.3s ease',
          }}>
            {t.msg}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastCtx.Provider>
  )
}

function useToast() {
  return useContext(ToastCtx)
}

export { ToastZone, useToast }
