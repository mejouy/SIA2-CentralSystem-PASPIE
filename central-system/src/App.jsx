import React, { useState, useEffect } from 'react';
import AdminDashboard from './pages/AdminDashboard'; // Adjust path if it's in a subfolder
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

  // Show full dashboard once authenticated
  return <AdminDashboard />;
}