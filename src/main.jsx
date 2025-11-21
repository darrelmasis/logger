import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {LoggerProvider, LoggerDisplay} from './index.js'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoggerProvider>
      <App />
      <LoggerDisplay />
    </LoggerProvider>
  </StrictMode>,
)
