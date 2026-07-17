import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import SystemManagement from './pages/SystemManagement';
import Login from './components/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const checkToken = () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setCheckingAuth(false);
  };

  useEffect(() => {
    checkToken();
  }, []);

  if (checkingAuth) return null; // Simple blank viewport while loading auth status

  if (!isAuthenticated) {
    // Show login screen if not authenticated
    return <Login onLoginSuccess={checkToken} />;
  }

  // Authenticated: enable routing between the dashboard and its subpages
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/system-management" element={<SystemManagement />} />
        {/* Any unknown path falls back to the dashboard instead of a blank screen */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}