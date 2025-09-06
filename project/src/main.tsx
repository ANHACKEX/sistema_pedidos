import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Importa o Supabase client
import { supabase } from './lib/supabaseClient'

// 🔹 Teste rápido de conexão com Supabase
supabase
  .from('usuarios')
  .select('*', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('❌ Supabase teste ERRO:', error.message)
    } else {
      console.log('✅ Supabase conectado – total de usuários:', count)
    }
  })

// 🔹 PWA Service Worker (pode deixar, isso não atrapalha)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Renderiza o app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
