import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionWrap, useSession } from './store/session'
import { ToastZone } from './components/Toast'
import Shell from './components/Shell'
import ChatBot from './components/ChatBot'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ChartPage from './pages/Chart'
import Analyze from './pages/Analyze'
import Trades from './pages/Trades'
import Signals from './pages/Signals'
import Analytics from './pages/Analytics'
import News from './pages/News'
import Alerts from './pages/Alerts'
import Learn from './pages/Learn'
import Config from './pages/Config'

function Guts() {
  let { flame, ready } = useSession()

  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0f', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 700,
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          KotvukAI
        </div>
      </div>
    )
  }

  if (!flame) return <Auth />

  return (
    <Shell>
      <Routes>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/chart" element={<ChartPage />} />
        <Route path="/app/analyze" element={<Analyze />} />
        <Route path="/app/trades" element={<Trades />} />
        <Route path="/app/signals" element={<Signals />} />
        <Route path="/app/analytics" element={<Analytics />} />
        <Route path="/app/news" element={<News />} />
        <Route path="/app/alerts" element={<Alerts />} />
        <Route path="/app/learn" element={<Learn />} />
        <Route path="/app/config" element={<Config />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
      <ChatBot />
    </Shell>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SessionWrap>
        <ToastZone>
          <Guts />
        </ToastZone>
      </SessionWrap>
    </BrowserRouter>
  )
}

let globalCSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0f; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 3px; }
  input:focus, select:focus { border-color: rgba(124,58,237,0.4) !important; }
`

let styleTag = document.createElement('style')
styleTag.textContent = globalCSS
document.head.appendChild(styleTag)

export default App
