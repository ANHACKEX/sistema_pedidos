import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logger } from './lib/logger'

// 🔹 PWA Service Worker (pode deixar, isso não atrapalha)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        logger.info('SW registered: ', registration)
      })
      .catch((registrationError) => {
        logger.error('SW registration failed: ', registrationError)
      })
  })
}

// Log app startup
logger.info('🚀 Gas Gestão+ iniciando...', {
  version: '2.0.0',
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString()
});
// Renderiza o app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
