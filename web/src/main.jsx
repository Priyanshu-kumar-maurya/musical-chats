import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'
import { installSecureStorageShield } from './utils/secureStorage.js'
import { installAntiInspectShield } from './utils/antiInspectShield.js'

// Initialize Military-Grade AES-256 Storage Encryption & Anti-Inspection Shield
installSecureStorageShield();
installAntiInspectShield();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
