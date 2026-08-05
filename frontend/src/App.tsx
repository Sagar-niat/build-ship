import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import DashboardPage from './pages/DashboardPage';
import DeviceGuardPage from './pages/DeviceGuardPage';
import GeminiChatPage from './pages/GeminiChatPage';
import AnalyzePage from './pages/AnalyzePage';
import QuarantinePage from './pages/QuarantinePage';
import PhishingPage from './pages/PhishingPage';
import PrivacyPage from './pages/PrivacyPage';
import SecurityEventsPage from './pages/SecurityEventsPage';
import AnomaliesPage from './pages/AnomaliesPage';
import DecisionsPage from './pages/DecisionsPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function LayoutWrapper() {
  const [demoText, setDemoText] = useState('');
  const [currentRole, setCurrentRole] = useState<'USER' | 'ADMIN'>('USER');
  const navigate = useNavigate();

  const handleLoadDemoThreat = () => {
    setDemoText('URGENT: Your account has been suspended today. Verify your credentials immediately using the link below: http://login-verify-account.com/auth');
    navigate('/analyze');
  };

  const toggleRole = () => {
    const nextRole = currentRole === 'USER' ? 'ADMIN' : 'USER';
    setCurrentRole(nextRole);
    if (nextRole === 'USER') {
      navigate('/device-guard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0d14] text-slate-100">
      <Sidebar currentRole={currentRole} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onLoadDemoThreat={handleLoadDemoThreat}
          currentRole={currentRole}
          onToggleRole={toggleRole}
        />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/device-guard" element={<DeviceGuardPage />} />
            <Route path="/gemini-chat" element={<GeminiChatPage />} />
            <Route path="/analyze" element={<AnalyzePage initialText={demoText} />} />
            <Route path="/quarantine" element={<QuarantinePage />} />
            
            {/* Admin/Analyst Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/phishing" element={<PhishingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/security-events" element={<SecurityEventsPage />} />
            <Route path="/anomalies" element={<AnomaliesPage />} />
            <Route path="/decisions" element={<DecisionsPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route path="*" element={<Navigate to={currentRole === 'USER' ? '/device-guard' : '/dashboard'} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/*" element={<LayoutWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}
