import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import MemberLogin from './pages/Member/Login'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/member/login" element={<MemberLogin />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
