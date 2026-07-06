import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, Avatar, Alert, InputAdornment, IconButton 
} from '@mui/material';
import { Hub, Visibility, VisibilityOff, Lock } from '@mui/icons-material';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        setSubmitting(false);
        if (data.success) {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminName', data.admin.name);
          onLoginSuccess();
        } else {
          setError(data.message || 'Invalid credentials');
        }
      })
      .catch(err => {
        setSubmitting(false);
        setError('Server communication failure.');
        console.error(err);
      });
  };

  return (
    <Box 
      sx={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        bgcolor: '#f8f9fa' 
      }}
    >
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 400, borderRadius: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2, boxShadow: 2 }}>
            <Hub sx={{ fontSize: 32 }} />
          </Avatar>
          
          <Typography variant="h5" fontWeight="800" gutterBottom>
            Control Center Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to manage Smart City central data pipelines
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, textAlign: 'left' }}>{error}</Alert>}

          {/* Using HTML <form> directly prevents property leakage to the DOM */}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Admin Email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              startIcon={<Lock />}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }}
            >
              {submitting ? 'Authenticating...' : 'Secure Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}