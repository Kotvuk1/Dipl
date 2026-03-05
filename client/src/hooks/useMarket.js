import { useState, useEffect, useRef } from 'react'

function useMarket(sym, interval, lim) {
  let [candles, setCandles] = useState([])
  let [tick, setTick] = useState(null)
  let limRef = useRef(lim)

  useEffect(() => {
    let alive = true

    async function grab() {
      try {
        let resp = await fetch(`/api/market/klines?symbol=${sym}&interval=${interval || '1h'}&limit=${limRef.current || 100}`)
        let data = await resp.json()
        if (alive && Array.isArray(data)) setCandles(data)
      } catch (e) {}
    }

    async function grabTick() {
      try {
        let resp = await fetch(`/api/market/ticker?symbol=${sym}`)
        let data = await resp.json()
        if (alive) setTick(data)
      } catch (e) {}
    }

    grab()
    grabTick()
    let timer = setInterval(() => { grab(); grabTick() }, 15000)

    return () => { alive = false; clearInterval(timer) }
  }, [sym, interval])

  return { candles, tick }
}

export { useMarket }
