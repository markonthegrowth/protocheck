import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/my-project" element={<App initialTab={5} />} />
        <Route path="/painpoint-collection" element={<App initialTab={1} />} />
        <Route path="/pattern-analysis" element={<App initialTab={2} />} />
        <Route path="/idea-validation" element={<App initialTab={3} />} />
        <Route path="/mvp-recommendation" element={<App initialTab={4} />} />
        <Route path="/app" element={<Navigate to="/my-project" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
