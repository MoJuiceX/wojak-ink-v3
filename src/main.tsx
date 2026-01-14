import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupIonicReact } from '@ionic/react'

/* Ionic CSS - only core.css to avoid overriding app scrolling */
import '@ionic/react/css/core.css'

import './index.css'
import App from './App.tsx'

/* Initialize Ionic React */
setupIonicReact({
  mode: 'ios',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
