import React, { useState } from 'react';
import { apiUrl } from '../utils/api';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, Avatar, Alert, InputAdornment, IconButton
} from '@mui/material';
import { Hub, Visibility, VisibilityOff, Lock } from '@mui/icons-material';

// ---- Design tokens -------------------------------------------------------
// Shared with the Admin Dashboard — see STYLE_GUIDE.md. Keep in sync.
const COLOR = {
  bg: '#F6F7F9',
  panel: '#FFFFFF',
  panelTint: '#EEF2F6',
  border: '#E1E5EA',
  navy: '#1B3A5C',
  navyDark: '#132A44',
  danger: '#C0392B',
  dangerBg: '#FBEAE8',
  neutral: '#8A93A3',
  textPrimary: '#1A2332',
  textSecondary: '#5B6472',
  textMuted: '#8A93A3',
};

const FONT_DISPLAY = "'IBM Plex Sans', 'Segoe UI', sans-serif";
const FONT_BODY = "'IBM Plex Sans', 'Segoe UI', sans-serif";
const FONT_MONO = "'IBM Plex Mono', 'Roboto Mono', monospace";

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

    fetch(apiUrl('/api/auth/login'), {
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

  const fieldSx = {
    mb: 2.25,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      fontFamily: FONT_BODY,
      bgcolor: COLOR.panel,
      '& fieldset': { borderColor: COLOR.border },
      '&:hover fieldset': { borderColor: COLOR.neutral },
      '&.Mui-focused fieldset': { borderColor: COLOR.navy, borderWidth: '1px' },
    },
    '& .MuiInputLabel-root': { fontFamily: FONT_BODY, color: COLOR.textSecondary },
    '& .MuiInputLabel-root.Mui-focused': { color: COLOR.navy },
  };

  return (
    <Box sx={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', bgcolor: COLOR.bg
    }}>
      {/* Letterhead strip, consistent with the dashboard */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, height: 4, width: '100%', bgcolor: COLOR.navy }} />

      <Card sx={{
        width: '100%', maxWidth: 400, borderRadius: 2, bgcolor: COLOR.panel,
        border: `1px solid ${COLOR.border}`, boxShadow: '0 12px 32px rgba(27,58,92,0.08)'
      }}>
        <CardContent sx={{ p: 4.5, textAlign: 'center' }}>
          <Avatar variant="rounded" sx={{
            bgcolor: COLOR.navy, width: 52, height: 52, mx: 'auto', mb: 2.5, borderRadius: 1.5
          }}>
            <Hub sx={{ fontSize: 28, color: '#fff' }} />
          </Avatar>

          <Typography sx={{
            fontFamily: FONT_MONO, color: COLOR.textMuted, fontSize: '0.68rem',
            letterSpacing: '2px', textTransform: 'uppercase', mb: 0.75
          }}>
            Smart City &bull; Integration Core
          </Typography>
          <Typography sx={{
            fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: '1.35rem',
            color: COLOR.textPrimary, letterSpacing: '-0.2px', mb: 0.75
          }}>
            Control Center Login
          </Typography>
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.85rem', color: COLOR.textSecondary, mb: 3.5 }}>
            Sign in to manage Smart City central data pipelines
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5, borderRadius: 1.5, textAlign: 'left', fontFamily: FONT_BODY,
                bgcolor: COLOR.dangerBg, color: COLOR.danger,
                border: `1px solid rgba(192,57,43,0.25)`,
                '& .MuiAlert-icon': { color: COLOR.danger }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Admin Email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={fieldSx}
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
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: COLOR.textMuted }}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
              sx={{ ...fieldSx, mb: 3.5 }}
            />
            <Button
              type="submit"
              variant="contained"
              disableElevation
              fullWidth
              disabled={submitting}
              startIcon={<Lock fontSize="small" />}
              sx={{
                py: 1.4, borderRadius: 1.5, fontWeight: 600, textTransform: 'none',
                fontFamily: FONT_BODY, fontSize: '0.95rem', bgcolor: COLOR.navy,
                '&:hover': { bgcolor: COLOR.navyDark },
                '&.Mui-disabled': { bgcolor: COLOR.panelTint, color: COLOR.textMuted }
              }}
            >
              {submitting ? 'Authenticating…' : 'Secure Login'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Typography sx={{
        fontFamily: FONT_MONO, fontSize: '0.68rem', color: COLOR.textMuted,
        letterSpacing: '1px', mt: 3
      }}>
        Systems Integration &amp; Architecture &mdash; Restricted Access
      </Typography>
    </Box>
  );
}