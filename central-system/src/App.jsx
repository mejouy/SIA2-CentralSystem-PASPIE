import React, { useState, useEffect } from 'react';
import AdminDashboard from './pages/AdminDashboard'; // Adjust path if it's in a subfolder
import Login from './components/Login';

// Optional: Quick Logout handling component wrapper
import { Button } from '@mui/material';
import { Logout } from '@mui/icons-material';

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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    setIsAuthenticated(false);
  };

  if (checkingAuth) return null; // Simple blank viewport while loading auth status

  if (!isAuthenticated) {
    // Show login screen if not authenticated
    return <Login onLoginSuccess={checkToken} />;
  }

  // Show full dashboard once authenticated
  return (
    <div style={{ position: 'relative' }}>
      {/* Absolute positioned floating logout button for development */}
      <Button 
        startIcon={<Logout />}
        variant="outlined" 
        color="error"
        onClick={handleLogout}
        sx={{ position: 'absolute', top: 32, right: 230, zIndex: 10, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
      >
        Logout
      </Button>
      
      <AdminDashboard />
    </div>
  );
}