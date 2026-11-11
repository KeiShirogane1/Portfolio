import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/tokens.css'
import './styles/base.css'
import './styles/nav.css'
import './styles/protractor.css'
import './styles/sections.css'
import './styles/motion.css'
import './styles/share.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
