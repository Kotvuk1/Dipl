import { useState, useEffect } from 'react'
import { watchAuth } from '../firebase'

function useAuthState() {
  let [person, setPerson] = useState(null)
  let [pending, setPending] = useState(true)

  useEffect(() => {
    let unsub = watchAuth((u) => {
      setPerson(u)
      setPending(false)
    })
    return () => unsub()
  }, [])

  return { person, pending }
}

export { useAuthState }
