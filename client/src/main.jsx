import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css';

import { AuthProvider } from './context/AuthContext.jsx' // Контекстті импорттау

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Қосымшаны AuthProvider-мен орау (Оборачиваем приложение) */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)