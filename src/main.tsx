import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { init } from './lib/store'
import './styles.css'

if (import.meta.env.VITE_DEMO) {
  // The preview frame can't show dialogs; accept confirmations and log alerts.
  window.confirm = () => true
  window.alert = (m?: unknown) => console.info(m)
}

void init()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD && !import.meta.env.VITE_DEMO) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'))
}
