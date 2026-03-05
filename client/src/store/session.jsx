import React, { createContext, useContext, useState, useEffect } from 'react'
import { watchAuth, bearerToken } from '../firebase'

let Ctx = createContext(null)

function SessionWrap({ children }) {
  let [flame, setFlame] = useState(null)
  let [profile, setProfile] = useState(null)
  let [ready, setReady] = useState(false)

  useEffect(() => {
    let unsub = watchAuth(async (u) => {
      setFlame(u)
      if (u) {
        try {
          let tkn = await u.getIdToken()
          let resp = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tkn}` },
          })
          let data = await resp.json()
          setProfile(data)
        } catch (e) {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setReady(true)
    })
    return () => unsub()
  }, [])

  return (
    <Ctx.Provider value={{ flame, profile, ready, setProfile }}>
      {children}
    </Ctx.Provider>
  )
}

function useSession() {
  return useContext(Ctx)
}

export { SessionWrap, useSession }
