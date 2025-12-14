import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import LoginPage from './LoginPage.jsx'
import ProjectListPage from './ProjectListPage.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 랜딩 페이지 */}
        <Route path="/" element={<LandingPage />} />
        
        {/* 로그인 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 프로젝트 목록 페이지 */}
        <Route path="/my-project" element={<ProjectListPage />} />
        
        {/* 프로젝트 워크스페이스 - 동적 라우팅 */}
        <Route path="/project/:projectId" element={<App />} />
        
        {/* 레거시 라우팅 - 리다이렉트 */}
        <Route path="/painpoint-collection" element={<Navigate to="/my-project" replace />} />
        <Route path="/pattern-analysis" element={<Navigate to="/my-project" replace />} />
        <Route path="/idea-validation" element={<Navigate to="/my-project" replace />} />
        <Route path="/mvp-recommendation" element={<Navigate to="/my-project" replace />} />
        <Route path="/app" element={<Navigate to="/my-project" replace />} />
        
        {/* 404 - 홈으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
