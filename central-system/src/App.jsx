import React from 'react';
import AdminDashboard from './pages/AdminDashboard';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0038a8' }, // Professional Admin Navy Blue
    background: { default: '#f8f9fa' }
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AdminDashboard />
    </ThemeProvider>
  );
}