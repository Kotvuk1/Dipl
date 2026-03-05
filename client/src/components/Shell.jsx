import React, { useState } from 'react'
import Sidebar from './Sidebar'

function Shell({ children }) {
  let [folded, setFolded] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f' }}>
      <Sidebar collapsed={folded} toggle={() => setFolded(!folded)} />
      <div style={{ flex: 1, overflow: 'auto', padding: 24, maxHeight: '100vh' }}>
        {children}
      </div>
    </div>
  )
}

export default Shell
