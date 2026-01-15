import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupIonicReact } from '@ionic/react'
import { ClerkProvider } from '@clerk/clerk-react'

/* Ionic CSS - only core.css to avoid overriding app scrolling */
import '@ionic/react/css/core.css'

import './index.css'
import App from './App.tsx'

/* Initialize Ionic React */
setupIonicReact({
  mode: 'ios',
})

// Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Warn if key is missing (auth will be disabled)
if (!CLERK_PUBLISHABLE_KEY) {
  console.warn(
    '[Clerk] Missing VITE_CLERK_PUBLISHABLE_KEY. Auth features will be disabled.\n' +
    'Add it to .env.local - see .env.example for details.'
  )
}

// Clerk appearance customization - orange theme with white background
const clerkAppearance = {
  elements: {
    // Card background
    userButtonPopoverCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
    },
    // All action buttons
    userButtonPopoverActionButton: {
      color: '#ea580c !important',
    },
    userButtonPopoverActionButtonText: {
      color: '#ea580c !important',
    },
    userButtonPopoverActionButtonIcon: {
      color: '#ea580c !important',
    },
    // Custom menu items
    userButtonPopoverCustomItemButton: {
      color: '#ea580c !important',
    },
    // Footer
    userButtonPopoverFooter: {
      backgroundColor: '#fff7ed',
    },
    // Menu items
    menuButton: {
      color: '#ea580c !important',
    },
    menuList: {
      backgroundColor: '#ffffff',
    },
    menuItem: {
      color: '#ea580c !important',
    },
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {CLERK_PUBLISHABLE_KEY ? (
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        appearance={clerkAppearance}
      >
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
)
